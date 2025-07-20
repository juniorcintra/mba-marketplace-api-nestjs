import { Attachment } from "@/domain/marketplace/enterprise/entities/attachment";

export class AttachmentPresenter {
  static toHTTP(attachment: Attachment) {
    return {
      id: attachment.id.toString(),
      url: `http://localhost:3333/attachments/${attachment.path}`,
    };
  }
}
