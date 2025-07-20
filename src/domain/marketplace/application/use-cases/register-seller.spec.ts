import { RegisterSellerUseCase } from "./register-seller";
import { InMemorySellersRepository } from "test/repositories/in-memory-sellers-repository";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { makeSeller } from "test/factories/make-seller";
import { EmailAlreadyExistsError } from "./errors/email-already-exists-error";
import { PhoneAlreadyExistsError } from "./errors/phone-already-exists-error";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { makeAttachment } from "test/factories/make-attachment";
import { InvalidPasswordConfirmationError } from "./errors/invalid-password-confirmation-error";
import { InMemoryUserAttachmentsRepository } from "test/repositories/in-memory-user-attachments-repository";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemorySellersRepository: InMemorySellersRepository;
let fakeHasher: FakeHasher;

let sut: RegisterSellerUseCase;

describe("Register Seller", () => {
  beforeEach(() => {
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository();
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
      inMemoryAttachmentsRepository,
    );
    fakeHasher = new FakeHasher();

    sut = new RegisterSellerUseCase(
      inMemorySellersRepository,
      inMemoryAttachmentsRepository,
      fakeHasher,
    );
  });

  it("should be able to register a seller without avatar", async () => {
    const result = await sut.execute({
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
      avatarId: null,
      password: "123456",
      passwordConfirmation: "123456",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      seller: expect.objectContaining({
        email: "johndoe@example.com",
        avatar: null,
      }),
    });
  });

  it("should be able to register a seller with avatar", async () => {
    const avatar = makeAttachment();

    await inMemoryAttachmentsRepository.create(avatar);

    const result = await sut.execute({
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
      avatarId: avatar.id.toString(),
      password: "123456",
      passwordConfirmation: "123456",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      seller: expect.objectContaining({
        email: "johndoe@example.com",
      }),
    });
    expect(result.value).toMatchObject({
      seller: expect.objectContaining({
        avatar: expect.objectContaining({
          id: avatar.id,
        }),
      }),
    });
  });

  it("should hash seller password upon registration", async () => {
    const result = await sut.execute({
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
      avatarId: null,
      password: "123456",
      passwordConfirmation: "123456",
    });

    const hashedPassword = await fakeHasher.hash("123456");

    expect(result.isRight()).toBe(true);
    expect(inMemorySellersRepository.items[0].password).toEqual(hashedPassword);
  });

  it("should not be able to register a seller with an invalid password confirmation", async () => {
    const seller = makeSeller({ email: "johndoe@example.com" });
    await inMemorySellersRepository.create(seller);

    const result = await sut.execute({
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
      avatarId: null,
      password: "123456",
      passwordConfirmation: "456789",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidPasswordConfirmationError);
  });

  it("should not be able to register a seller with an already registered email", async () => {
    const seller = makeSeller({ email: "johndoe@example.com" });
    await inMemorySellersRepository.create(seller);

    const result = await sut.execute({
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
      avatarId: null,
      password: "123456",
      passwordConfirmation: "123456",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(EmailAlreadyExistsError);
  });

  it("should not be able to register a seller with an already registered phone", async () => {
    const seller = makeSeller({ phone: "123456789" });
    await inMemorySellersRepository.create(seller);

    const result = await sut.execute({
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
      avatarId: null,
      password: "123456",
      passwordConfirmation: "123456",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(PhoneAlreadyExistsError);
  });

  it("should not be able to register a seller with an invalid avatar", async () => {
    const result = await sut.execute({
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
      avatarId: "invalid-avatar",
      password: "123456",
      passwordConfirmation: "123456",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should persist attachments when creating a new seller", async () => {
    const avatar = makeAttachment({}, new UniqueEntityID("1"));
    await inMemoryAttachmentsRepository.create(avatar);

    const result = await sut.execute({
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
      avatarId: "1",
      password: "123456",
      passwordConfirmation: "123456",
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryUserAttachmentsRepository.items).toHaveLength(1);
    expect(inMemoryUserAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attachmentId: new UniqueEntityID("1"),
        }),
      ]),
    );
  });
});
