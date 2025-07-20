import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ProductAttachment } from "@/domain/marketplace/enterprise/entities/product-attachment";
import { Prisma, Attachment as PrismaProductAttachment } from "@prisma/client";

export class PrismaProductAttachmentMapper {
  static toDomain(raw: PrismaProductAttachment): ProductAttachment {
    if (!raw.productId) {
      throw new Error("Invalid attachment type.");
    }

    return ProductAttachment.create(
      {
        productId: new UniqueEntityID(raw.productId),
        attachmentId: new UniqueEntityID(raw.id),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrismaUpdateMany(
    attachments: ProductAttachment[],
  ): Prisma.AttachmentUpdateManyArgs {
    const attachmentIds = attachments.map((attachment) => {
      return attachment.attachmentId.toString();
    });

    return {
      where: {
        id: {
          in: attachmentIds,
        },
      },
      data: {
        productId: attachments[0].productId.toString(),
      },
    };
  }
}
