import {
  Product as PrismaProduct,
  Category as PrismaCategory,
  Attachment as PrismaAttachment,
} from "@prisma/client";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ProductDetails } from "@/domain/marketplace/enterprise/entities/value-objects/product-details";
import { PrismaAttachmentMapper } from "./prisma-attachment-mapper";
import { ProductStatus } from "@/domain/marketplace/enterprise/entities/product";
import {
  PrismaUserWithAvatar,
  PrismaUserWithAvatarMapper,
} from "./prisma-user-with-avatar-mapper";
import { PrismaCategoryMapper } from "./prisma-category-mapper";

export type PrismaProductDetails = PrismaProduct & {
  owner: PrismaUserWithAvatar;
  category: PrismaCategory;
  attachments: PrismaAttachment[];
};

export class PrismaProductDetailsMapper {
  static toDomain(raw: PrismaProductDetails): ProductDetails {
    return ProductDetails.create({
      productId: new UniqueEntityID(raw.id),
      title: raw.title,
      description: raw.description,
      priceInCents: raw.priceInCents,
      status: ProductStatus[raw.status.toUpperCase()],
      owner: PrismaUserWithAvatarMapper.toDomain(raw.owner),
      category: PrismaCategoryMapper.toDomain(raw.category),
      attachments: raw.attachments.map(PrismaAttachmentMapper.toDomain),
      createdAt: raw.createdAt,
      statusAt: raw.statusAt,
    });
  }
}
