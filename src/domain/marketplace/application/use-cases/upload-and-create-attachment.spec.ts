import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { UploadAndCreateAttachmentUseCase } from "./upload-and-create-attachment";
import { FakeUploader } from "test/storage/fake-uploader";
import { InvalidAttachmentTypeError } from "./errors/invalid-attachment-type-error";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let fakeUploader: FakeUploader;

let sut: UploadAndCreateAttachmentUseCase;

describe("Upload and create attachment", () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    fakeUploader = new FakeUploader();

    sut = new UploadAndCreateAttachmentUseCase(
      inMemoryAttachmentsRepository,
      fakeUploader,
    );
  });

  it("should be able to upload and create an attachment", async () => {
    const result = await sut.execute([
      {
        fileName: "profile.png",
        fileType: "image/png",
        body: Buffer.from(""),
      },
      {
        fileName: "profile.png",
        fileType: "image/png",
        body: Buffer.from(""),
      },
    ]);

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      attachments: [
        expect.objectContaining({
          id: expect.any(UniqueEntityID),
          path: expect.any(String),
        }),
        expect.objectContaining({
          id: expect.any(UniqueEntityID),
          path: expect.any(String),
        }),
      ],
    });

    expect(fakeUploader.uploads).toHaveLength(2);
    expect(fakeUploader.uploads[0]).toEqual(
      expect.objectContaining({
        fileName: "profile.png",
      }),
    );
  });

  it("should not be able to upload an attachment with invalid file type", async () => {
    const result = await sut.execute([
      {
        fileName: "profile.mp3",
        fileType: "audio/mpeg",
        body: Buffer.from(""),
      },
    ]);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError);
  });
});
