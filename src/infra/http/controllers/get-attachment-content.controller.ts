import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Res,
} from "@nestjs/common";
import { GetAttachmentContentUseCase } from "@/domain/marketplace/application/use-cases/get-attachment-content";
import { Response } from "express";

@Controller("/attachments/:path")
export class GetAttachmentContentController {
  constructor(
    private getAttachmentContentUseCase: GetAttachmentContentUseCase,
  ) {}

  @Get()
  async handle(@Param("path") path: string, @Res() response: Response) {
    const result = await this.getAttachmentContentUseCase.execute({ path });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const attachmentContent = result.value;

    return response.sendFile(attachmentContent);
  }
}
