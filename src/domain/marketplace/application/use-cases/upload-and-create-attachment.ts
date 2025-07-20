import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { InvalidAttachmentTypeError } from "./errors/invalid-attachment-type-error";
import { Attachment } from "../../enterprise/entities/attachment";
import { AttachmentsRepository } from "../repositories/attachments-repository";
import { Uploader } from "../storage/uploader";

interface UploadAndCreateAttachmentRequest {
  fileName: string;
  fileType: string;
  body: Buffer;
}

type UploadAndCreateAttachmentResponse = Either<
  InvalidAttachmentTypeError,
  { attachments: Attachment[] }
>;

@Injectable()
export class UploadAndCreateAttachmentUseCase {
  constructor(
    private attachmentsRepository: AttachmentsRepository,
    private uploader: Uploader,
  ) {}

  async execute(
    files: UploadAndCreateAttachmentRequest[],
  ): Promise<UploadAndCreateAttachmentResponse> {
    for (const file of files) {
      if (!/^image\/(png|jpe?g)$/.test(file.fileType)) {
        return left(new InvalidAttachmentTypeError(file.fileType));
      }
    }

    const { paths } = await this.uploader.upload(files);

    const attachments = paths.map((path) => {
      const attachment = Attachment.create({
        path,
      });

      return attachment;
    });

    await this.attachmentsRepository.createMany(attachments);

    return right({
      attachments,
    });
  }
}
