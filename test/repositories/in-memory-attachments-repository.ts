import { AttachmentsRepository } from "@/domain/marketplace/application/repositories/attachments-repository";
import { Attachment } from "@/domain/marketplace/enterprise/entities/attachment";

export class InMemoryAttachmentsRepository implements AttachmentsRepository {
  public items: Attachment[] = [];

  async findById(id: string) {
    const attachment = this.items.find((item) => item.id.toString() === id);

    if (!attachment) {
      return null;
    }

    return attachment;
  }

  async findManyByIds(ids: string[]) {
    const data: Attachment[] = [];
    const inexistentIds: string[] = [];

    for (const id of ids) {
      const attachment = this.items.find((item) => item.id.toString() === id);

      if (attachment) {
        data.push(attachment);
      } else {
        inexistentIds.push(id);
      }
    }

    return {
      data,
      hasAll: inexistentIds.length === 0,
      inexistentIds,
    };
  }

  async create(attachment: Attachment) {
    this.items.push(attachment);
  }

  async createMany(attachments: Attachment[]) {
    this.items.push(...attachments);
  }
}
