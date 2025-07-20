import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserAttachment } from "@/domain/marketplace/enterprise/entities/user/user-attachment";
import { Prisma, Attachment as PrismaUserAttachment } from "@prisma/client";

export class PrismaUserAttachmentMapper {
  static toDomain(raw: PrismaUserAttachment): UserAttachment {
    if (!raw.userId) {
      throw new Error("Invalid attachment type.");
    }

    return UserAttachment.create(
      {
        userId: new UniqueEntityID(raw.userId),
        attachmentId: new UniqueEntityID(raw.id),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrismaUpdate(
    userAttachment: UserAttachment,
  ): Prisma.AttachmentUpdateArgs {
    return {
      where: {
        id: userAttachment.attachmentId.toString(),
      },
      data: {
        userId: userAttachment.userId.toString(),
      },
    };
  }
}
