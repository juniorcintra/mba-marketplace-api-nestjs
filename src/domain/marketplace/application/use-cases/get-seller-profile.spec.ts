import { GetSellerProfileUseCase } from "./get-seller-profile";
import { InMemorySellersRepository } from "test/repositories/in-memory-sellers-repository";
import { makeSeller } from "test/factories/make-seller";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { InMemoryUserAttachmentsRepository } from "test/repositories/in-memory-user-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { makeAttachment } from "test/factories/make-attachment";
import { makeUserAttachment } from "test/factories/make-user-attachment";
import { UserAttachmentList } from "../../enterprise/entities/user/user-attachment-list";

let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemorySellersRepository: InMemorySellersRepository;
let sut: GetSellerProfileUseCase;

describe("Get Seller profile", () => {
  beforeEach(() => {
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository();
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
      inMemoryAttachmentsRepository,
    );
    sut = new GetSellerProfileUseCase(inMemorySellersRepository);
  });

  it("should be able to get a seller profile", async () => {
    await inMemoryAttachmentsRepository.create(
      makeAttachment({}, new UniqueEntityID("1")),
    );

    const userAttachmet1 = makeUserAttachment({
      attachmentId: new UniqueEntityID("1"),
      userId: new UniqueEntityID("seller-1"),
    });

    const newSeller = makeSeller(
      {
        avatar: new UserAttachmentList([userAttachmet1]),
      },
      new UniqueEntityID("seller-1"),
    );

    await inMemorySellersRepository.create(newSeller);

    const result = await sut.execute({
      id: "seller-1",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      seller: expect.objectContaining({
        email: newSeller.email,
        avatar: expect.objectContaining({
          id: userAttachmet1.attachmentId,
        }),
      }),
    });
  });

  it("should not be able to get a non-existent seller profile", async () => {
    const result = await sut.execute({
      id: "seller-1",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
