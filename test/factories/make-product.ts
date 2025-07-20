import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
  Product,
  ProductProps,
} from "@/domain/marketplace/enterprise/entities/product";
import { ProductAttachmentList } from "@/domain/marketplace/enterprise/entities/product-attachment-list";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { PrismaProductMapper } from "@/infra/database/prisma/mappers/prisma-product-mapper";

export function makeProduct(
  override: Partial<ProductProps> = {},
  id?: UniqueEntityID,
) {
  const product = Product.create(
    {
      title: faker.lorem.sentence(),
      description: faker.lorem.text(),
      priceInCents: faker.number.int(10),
      ownerId: new UniqueEntityID(),
      categoryId: new UniqueEntityID(),
      attachments: new ProductAttachmentList(),
      ...override,
    },
    id,
  );

  return product;
}

@Injectable()
export class ProductFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaProduct(data: Partial<ProductProps> = {}): Promise<Product> {
    const product = makeProduct(data);

    await this.prisma.product.create({
      data: PrismaProductMapper.toPrisma(product),
    });

    return product;
  }
}
