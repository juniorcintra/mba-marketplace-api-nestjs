import { InvalidAttachmentTypeError } from "@/domain/marketplace/application/use-cases/errors/invalid-attachment-type-error";
import { UploadAndCreateAttachmentUseCase } from "@/domain/marketplace/application/use-cases/upload-and-create-attachment";
import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { AttachmentPresenter } from "../presenters/attachment-presenter";
import { Public } from "@/infra/auth/public";

@Controller("/attachments")
export class UploadAttachmenstController {
  constructor(
    private uploadAndCreateAttachment: UploadAndCreateAttachmentUseCase,
  ) {}

  @Post()
  @Public()
  @UseInterceptors(FilesInterceptor("files"))
  async handle(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 2, // 2mb
          }),
          new FileTypeValidator({
            fileType: ".(png|jpg|jpeg)",
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    const filesToUpload = files.map((file) => {
      return {
        fileName: file.originalname,
        fileType: file.mimetype,
        body: file.buffer,
      };
    });

    const result = await this.uploadAndCreateAttachment.execute(filesToUpload);

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case InvalidAttachmentTypeError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    const { attachments } = result.value;
    return {
      attachments: attachments.map(AttachmentPresenter.toHTTP),
    };
  }
}
