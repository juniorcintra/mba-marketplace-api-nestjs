import { FakeUploader } from "test/storage/fake-uploader";
import { GetAttachmentContentUseCase } from "./get-attachment-content";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

let fakeUploader: FakeUploader;

let sut: GetAttachmentContentUseCase;

describe("Get attachment content", () => {
  beforeEach(() => {
    fakeUploader = new FakeUploader();

    sut = new GetAttachmentContentUseCase(fakeUploader);
  });

  it("should be able to get an attachment content", async () => {
    const path = "123456789-profile.png";

    fakeUploader.uploads.push({
      fileName: "profile.png",
      path,
    });

    const result = await sut.execute({
      path,
    });

    expect(result.isRight()).toBe(true);
    expect(typeof result.value).toBe("string");
  });

  it("should not be able to get an attachment content from a non-existent uploaded attachment", async () => {
    const result = await sut.execute({
      path: "123456789-profile.png",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
