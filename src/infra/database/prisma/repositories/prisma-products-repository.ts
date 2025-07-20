import {
  Count,
  FindMany,
  FindManyByOwner,
  ProductsRepository,
} from "@/domain/marketplace/application/repositories/products-repository";
import { Product } from "@/domain/marketplace/enterprise/entities/product";
import { Injectable } from "@nestjs/common";
import { PrismaProductMapper } from "../mappers/prisma-product-mapper";
import { PrismaService } from "../prisma.service";
import { ProductAttachmentsRepository } from "@/domain/marketplace/application/repositories/product-attachments-repository";
import { ProductDetails } from "@/domain/marketplace/enterprise/entities/value-objects/product-details";
import { PrismaProductDetailsMapper } from "../mappers/prisma-product-details-mapper";
import { AttachmentsRepository } from "@/domain/marketplace/application/repositories/attachments-repository";

@Injectable()
export class PrismaProductsRepository implements ProductsRepository {
  constructor(
    private prisma: PrismaService,
    private productAttachmentsRepository: ProductAttachmentsRepository,
    private attachmentsRepository: AttachmentsRepository,
  ) {}

  async count({ sellerId, from, status }: Count): Promise<number> {
    const where: Record<string, unknown> = {
      ownerId: sellerId,
    };

    if (from) {
      where.statusAt = { gte: new Date(from.setHours(0, 0, 0, 0)) };
    }

    if (status) {
      where.status = status;
    }

    const amount = await this.prisma.product.count({
      where,
    });

    return amount;
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return null;
    }

    return PrismaProductMapper.toDomain(product);
  }

  async findDetailsById(id: string): Promise<ProductDetails | null> {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        owner: {
          include: {
            avatar: true,
          },
        },
        category: true,
        attachments: true,
      },
    });

    if (!product) {
      return null;
    }

    return PrismaProductDetailsMapper.toDomain(product);
  }

  async findManyByOwner({
    ownerId,
    search,
    status,
  }: FindManyByOwner): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        ownerId,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(status ? { status } : {}),
      },
    });

    return products.map(PrismaProductMapper.toDomain);
  }

  async findManyWithDetailsByOwner({
    ownerId,
    search,
    status,
  }: FindManyByOwner): Promise<ProductDetails[]> {
    const products = await this.prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        ownerId,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(status ? { status } : {}),
      },
      include: {
        owner: {
          include: {
            avatar: true,
          },
        },
        category: true,
        attachments: true,
      },
    });

    return products.map(PrismaProductDetailsMapper.toDomain);
  }

  async findMany({ page, search, status }: FindMany): Promise<Product[]> {
    const perPage = 3;

    const products = await this.prisma.product.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(status ? { status } : {}),
      },
    });

    return products.map(PrismaProductMapper.toDomain);
  }

  async findManyWithDetails({
    page,
    search,
    status,
  }: FindMany): Promise<ProductDetails[]> {
    const perPage = 3;

    const products = await this.prisma.product.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(status ? { status } : {}),
      },
      include: {
        owner: {
          include: {
            avatar: true,
          },
        },
        category: true,
        attachments: true,
      },
    });

    return products.map(PrismaProductDetailsMapper.toDomain);
  }

  async save(product: Product): Promise<ProductDetails> {
    const data = PrismaProductMapper.toPrisma(product);

    await Promise.all([
      this.prisma.product.update({
        where: {
          id: product.id.toString(),
        },
        data,
      }),
      this.productAttachmentsRepository.createMany(
        product.attachments.getNewItems(),
      ),
      this.productAttachmentsRepository.deleteMany(
        product.attachments.getRemovedItems(),
      ),
    ]);

    const productWithDetails = await this.prisma.product.findUnique({
      where: {
        id: product.id.toString(),
      },
      include: {
        owner: {
          include: {
            avatar: true,
          },
        },
        category: true,
        attachments: true,
      },
    });

    if (!productWithDetails) {
      throw new Error(`product not created.`);
    }

    return PrismaProductDetailsMapper.toDomain(productWithDetails);
  }

  async create(product: Product): Promise<ProductDetails> {
    const data = PrismaProductMapper.toPrisma(product);

    await this.prisma.product.create({
      data,
    });

    await this.productAttachmentsRepository.createMany(
      product.attachments.getItems(),
    );

    const productWithDetails = await this.prisma.product.findUnique({
      where: {
        id: product.id.toString(),
      },
      include: {
        owner: {
          include: {
            avatar: true,
          },
        },
        category: true,
        attachments: true,
      },
    });

    if (!productWithDetails) {
      throw new Error(`product not created.`);
    }

    return PrismaProductDetailsMapper.toDomain(productWithDetails);
  }
}
