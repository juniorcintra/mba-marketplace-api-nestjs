import {
  AsyncFindMany,
  AttachmentsRepository,
} from "@/domain/marketplace/application/repositories/attachments-repository";
import { Attachment } from "@/domain/marketplace/enterprise/entities/attachment";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaAttachmentMapper } from "../mappers/prisma-attachment-mapper";

@Injectable()
export class PrismaAttachmentsRepository implements AttachmentsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Attachment | null> {
    const attachment = await this.prisma.attachment.findUnique({
      where: {
        id,
      },
    });

    if (!attachment) {
      return null;
    }

    return PrismaAttachmentMapper.toDomain(attachment);
  }

  async findManyByIds(ids: string[]): AsyncFindMany<Attachment> {
    const foundAttachments = await this.prisma.attachment.findMany({
      where: {
        id: { in: ids },
      },
    });

    const foundIds = foundAttachments.map((attachment) => attachment.id);

    const inexistentIds = ids.filter((id) => !foundIds.includes(id));

    return {
      data: foundAttachments.map(PrismaAttachmentMapper.toDomain),
      hasAll: inexistentIds.length === 0,
      inexistentIds,
    };
  }

  async create(attachment: Attachment): Promise<void> {
    const data = PrismaAttachmentMapper.toPrisma(attachment);

    await this.prisma.attachment.create({
      data,
    });
  }

  async createMany(attachments: Attachment[]): Promise<void> {
    const data = attachments.map((attachment) =>
      PrismaAttachmentMapper.toPrisma(attachment),
    );

    await this.prisma.attachment.createMany({
      data,
    });
  }
}
