import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { Uploader } from "../storage/uploader";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface GetAttachmentContentRequest {
  path: string;
}

type GetAttachmentContentResponse = Either<ResourceNotFoundError, string>;

@Injectable()
export class GetAttachmentContentUseCase {
  constructor(private uploader: Uploader) {}

  async execute({
    path,
  }: GetAttachmentContentRequest): Promise<GetAttachmentContentResponse> {
    const attachmentContent = await this.uploader.get(path);

    if (!attachmentContent) {
      return left(new ResourceNotFoundError());
    }

    return right(attachmentContent);
  }
}
