import { EditSellerUseCase } from "./edit-seller";
import { InMemorySellersRepository } from "test/repositories/in-memory-sellers-repository";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { makeSeller } from "test/factories/make-seller";
import { EmailAlreadyExistsError } from "./errors/email-already-exists-error";
import { PhoneAlreadyExistsError } from "./errors/phone-already-exists-error";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { makeAttachment } from "test/factories/make-attachment";
import { InMemoryUserAttachmentsRepository } from "test/repositories/in-memory-user-attachments-repository";
import { WrongCredentialsError } from "./errors/wrong-credentials-error";
import { makeUserAttachment } from "test/factories/make-user-attachment";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserAttachmentList } from "../../enterprise/entities/user/user-attachment-list";

let inMemorySellersRepository: InMemorySellersRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository;
let fakeHasher: FakeHasher;

let sut: EditSellerUseCase;

describe("Edit Seller", () => {
  beforeEach(() => {
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository();
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
      inMemoryAttachmentsRepository,
    );
    fakeHasher = new FakeHasher();

    sut = new EditSellerUseCase(
      inMemorySellersRepository,
      inMemoryAttachmentsRepository,
      inMemoryUserAttachmentsRepository,
      fakeHasher,
      fakeHasher,
    );
  });

  it("should be able to edit a seller", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      seller: expect.objectContaining({
        email: "johndoe@example.com",
        avatar: null,
      }),
    });
  });

  it("should be able to edit a seller avatar", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const avatar = makeAttachment();
    await inMemoryAttachmentsRepository.create(avatar);

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      name: seller.name,
      phone: seller.phone,
      email: seller.email,
      avatarId: avatar.id.toString(),
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      seller: expect.objectContaining({
        email: seller.email,
        avatar: expect.objectContaining({
          id: avatar.id,
        }),
      }),
    });
  });

  it("should hash seller new password upon edition", async () => {
    const seller = makeSeller({ password: await fakeHasher.hash("123456") });
    await inMemorySellersRepository.create(seller);

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      name: seller.name,
      phone: seller.phone,
      email: seller.email,
      password: "123456",
      newPassword: "456789",
    });

    const hashedPassword = await fakeHasher.hash("456789");

    expect(result.isRight()).toBe(true);
    expect(inMemorySellersRepository.items[0].password).toEqual(hashedPassword);
  });

  it("should not be able to edit a seller password with wrong current password", async () => {
    const seller = makeSeller({ password: await fakeHasher.hash("123456") });
    await inMemorySellersRepository.create(seller);

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      name: seller.name,
      phone: seller.phone,
      email: seller.email,
      password: "123",
      newPassword: "456789",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(WrongCredentialsError);
  });

  it("should not be able to edit a seller with an already registered email", async () => {
    const seller1 = makeSeller({ email: "johndoe@example.com" });
    await inMemorySellersRepository.create(seller1);

    const seller2 = makeSeller({ email: "test@example.com" });
    await inMemorySellersRepository.create(seller2);

    const result = await sut.execute({
      sellerId: seller2.id.toString(),
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(EmailAlreadyExistsError);
  });

  it("should not be able to edit a seller with an already registered phone", async () => {
    const seller1 = makeSeller({ phone: "123456789" });
    await inMemorySellersRepository.create(seller1);

    const seller2 = makeSeller({ phone: "000000000" });
    await inMemorySellersRepository.create(seller2);

    const result = await sut.execute({
      sellerId: seller2.id.toString(),
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PhoneAlreadyExistsError);
  });

  it("should not be able to edit a seller without a valid avatar", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const result = await sut.execute({
      sellerId: seller.id.toString(),
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
      avatarId: "invalid-avatar",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should sync new and removed attachment when editing an seller", async () => {
    await inMemoryAttachmentsRepository.createMany([
      makeAttachment({}, new UniqueEntityID("1")),
      makeAttachment({}, new UniqueEntityID("2")),
    ]);

    const userAttachmet1 = makeUserAttachment({
      attachmentId: new UniqueEntityID("1"),
      userId: new UniqueEntityID("user-1"),
    });

    const seller = makeSeller(
      {
        avatar: new UserAttachmentList([userAttachmet1]),
      },
      new UniqueEntityID("user-1"),
    );

    await inMemorySellersRepository.create(seller);

    const result = await sut.execute({
      sellerId: "user-1",
      name: seller.name,
      phone: seller.phone,
      email: seller.email,
      avatarId: "2",
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryUserAttachmentsRepository.items).toHaveLength(1);
    expect(inMemoryUserAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attachmentId: new UniqueEntityID("2"),
        }),
      ]),
    );
  });
});
