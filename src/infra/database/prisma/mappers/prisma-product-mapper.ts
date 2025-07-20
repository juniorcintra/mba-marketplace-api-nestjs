import { Product as PrismaProduct, Prisma } from "@prisma/client";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
  Product,
  ProductStatus,
} from "@/domain/marketplace/enterprise/entities/product";

export class PrismaProductMapper {
  static toDomain(raw: PrismaProduct): Product {
    return Product.create(
      {
        title: raw.title,
        description: raw.description,
        priceInCents: raw.priceInCents,
        status: ProductStatus[raw.status.toUpperCase()],
        ownerId: new UniqueEntityID(raw.ownerId),
        categoryId: new UniqueEntityID(raw.categoryId),
        createdAt: raw.createdAt,
        statusAt: raw.statusAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(product: Product): Prisma.ProductUncheckedCreateInput {
    return {
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      status: product.status.toString(),
      ownerId: product.ownerId.toString(),
      categoryId: product.categoryId.toString(),
      createdAt: product.createdAt,
      statusAt: product.statusAt,
    };
  }
}
