import { UserAttachmentsRepository } from "@/domain/marketplace/application/repositories/user-attachments-repository";
import { UserAttachment } from "@/domain/marketplace/enterprise/entities/user/user-attachment";

export class InMemoryUserAttachmentsRepository
  implements UserAttachmentsRepository
{
  public items: UserAttachment[] = [];

  async findByUserId(userId: string) {
    const attachment = this.items.find(
      (item) => item.userId.toString() === userId,
    );

    if (!attachment) {
      return null;
    }

    return attachment;
  }

  async create(attachment: UserAttachment) {
    this.items.push(attachment);
  }

  async delete(attachment: UserAttachment) {
    const itemIndex = this.items.findIndex((item) => item.id === attachment.id);

    this.items.splice(itemIndex, 1);
  }
}
