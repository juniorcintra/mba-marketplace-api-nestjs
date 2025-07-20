import { UserAttachmentsRepository } from "@/domain/marketplace/application/repositories/user-attachments-repository";
import { UserAttachment } from "@/domain/marketplace/enterprise/entities/user/user-attachment";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaUserAttachmentMapper } from "../mappers/prisma-user-attachment-mapper";

@Injectable()
export class PrismaUserAttachmentsRepository
  implements UserAttachmentsRepository
{
  constructor(private prisma: PrismaService) {}
  async findByUserId(userId: string): Promise<UserAttachment | null> {
    const userAttachment = await this.prisma.attachment.findUnique({
      where: {
        userId,
      },
    });

    if (!userAttachment) {
      return null;
    }

    return PrismaUserAttachmentMapper.toDomain(userAttachment);
  }

  async create(attachment: UserAttachment): Promise<void> {
    if (!attachment) {
      return;
    }

    const data = PrismaUserAttachmentMapper.toPrismaUpdate(attachment);

    await this.prisma.attachment.update(data);
  }

  async delete(attachment: UserAttachment): Promise<void> {
    if (!attachment) {
      return;
    }

    await this.prisma.attachment.delete({
      where: {
        id: attachment.id.toString(),
      },
    });
  }
}
