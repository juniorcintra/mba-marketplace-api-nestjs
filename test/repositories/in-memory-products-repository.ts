import {
  Count,
  FindMany,
  FindManyByOwner,
  ProductsRepository,
} from "@/domain/marketplace/application/repositories/products-repository";
import { Product } from "@/domain/marketplace/enterprise/entities/product";
import { normalizeDate } from "test/utils/normalizeDate";
import { InMemorySellersRepository } from "./in-memory-sellers-repository";
import { InMemoryProductAttachmentsRepository } from "./in-memory-product-attachments-repository";
import { InMemoryCategoriesRepository } from "./in-memory-categories-repository";
import { InMemoryAttachmentsRepository } from "./in-memory-attachments-repository";
import { ProductDetails } from "@/domain/marketplace/enterprise/entities/value-objects/product-details";
import { InMemoryUserAttachmentsRepository } from "./in-memory-user-attachments-repository";
import { Attachment } from "@/domain/marketplace/enterprise/entities/attachment";
import { UserWithAvatar } from "@/domain/marketplace/enterprise/entities/value-objects/user-with-avatar";

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = [];

  constructor(
    private productAttachmentsRepository: InMemoryProductAttachmentsRepository,
    private userAttachmentsRepository: InMemoryUserAttachmentsRepository,
    private sellersRepository: InMemorySellersRepository,
    private categoriesRepository: InMemoryCategoriesRepository,
    private attachmentsRepository: InMemoryAttachmentsRepository,
  ) {}

  async count({ sellerId, status, from }: Count) {
    let filteredProducts = this.items;

    const normalizedFrom = from ? normalizeDate(from) : null;

    filteredProducts = filteredProducts.filter((product) => {
      const productStatusAt = normalizeDate(product.statusAt);

      return (
        product.ownerId.toString() === sellerId &&
        (!status || product.status.toString() === status) &&
        (!from || productStatusAt >= normalizedFrom!)
      );
    });

    return filteredProducts.length;
  }

  async findById(id: string) {
    const product = this.items.find((item) => item.id.toString() === id);

    if (!product) {
      return null;
    }

    return product;
  }

  async findDetailsById(id: string) {
    const product = this.items.find((item) => item.id.toString() === id);

    if (!product) {
      return null;
    }

    const owner = await this.sellersRepository.findWithAvatarById(
      product.ownerId.toString(),
    );

    if (!owner) {
      throw new Error(
        `owner with ID "${product.ownerId.toString()}" does not exist.`,
      );
    }

    const category = this.categoriesRepository.items.find((category) => {
      return category.id.equals(product.categoryId);
    });

    if (!category) {
      throw new Error(
        `category with ID "${product.categoryId.toString()}" does not exist.`,
      );
    }

    const productAttachments = this.productAttachmentsRepository.items.filter(
      (productAttachment) => {
        return productAttachment.productId.equals(product.id);
      },
    );

    const attachments = productAttachments.map((productAttachment) => {
      const attachment = this.attachmentsRepository.items.find((attachment) => {
        return attachment.id.equals(productAttachment.attachmentId);
      });

      if (!attachment) {
        throw new Error(
          `Attachment with ID "${productAttachment.attachmentId.toString()}" does not exist.`,
        );
      }

      return attachment;
    });

    return ProductDetails.create({
      productId: product.id,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      status: product.status,
      owner,
      category,
      attachments,
      createdAt: product.createdAt,
      statusAt: product.statusAt,
    });
  }

  async findManyByOwner({ ownerId, search, status }: FindManyByOwner) {
    let filteredProducts = this.items;

    filteredProducts = filteredProducts.filter(
      (product) => product.ownerId.toString() === ownerId,
    );

    if (search) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.title.includes(search) ||
          product.description.includes(search),
      );
    }

    if (status) {
      filteredProducts = filteredProducts.filter(
        (product) => product.status === status,
      );
    }

    const products = filteredProducts.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return products;
  }

  async findManyWithDetailsByOwner({
    ownerId,
    search,
    status,
  }: FindManyByOwner) {
    let filteredProducts = this.items;

    filteredProducts = filteredProducts.filter(
      (product) => product.ownerId.toString() === ownerId,
    );

    if (search) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.title.includes(search) ||
          product.description.includes(search),
      );
    }

    if (status) {
      filteredProducts = filteredProducts.filter(
        (product) => product.status === status,
      );
    }

    const products = filteredProducts.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const owner = await this.sellersRepository.findWithAvatarById(ownerId);

    if (!owner) {
      throw new Error(`owner with ID "${ownerId}" does not exist.`);
    }

    const productsWithDetails = products.map((product) => {
      const category = this.categoriesRepository.items.find((category) => {
        return category.id.equals(product.categoryId);
      });

      if (!category) {
        throw new Error(
          `category with ID "${product.categoryId.toString()}" does not exist.`,
        );
      }

      const productAttachments = this.productAttachmentsRepository.items.filter(
        (productAttachment) => {
          return productAttachment.productId.equals(product.id);
        },
      );

      const attachments = productAttachments.map((productAttachment) => {
        const attachment = this.attachmentsRepository.items.find(
          (attachment) => {
            return attachment.id.equals(productAttachment.attachmentId);
          },
        );

        if (!attachment) {
          throw new Error(
            `Attachment with ID "${productAttachment.attachmentId.toString()}" does not exist.`,
          );
        }

        return attachment;
      });

      return ProductDetails.create({
        productId: product.id,
        title: product.title,
        description: product.description,
        priceInCents: product.priceInCents,
        status: product.status,
        owner,
        category,
        attachments,
        createdAt: product.createdAt,
        statusAt: product.statusAt,
      });
    });

    return productsWithDetails;
  }

  async findMany({ page, search, status }: FindMany) {
    let filteredProducts = this.items;

    if (search) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.title.includes(search) ||
          product.description.includes(search),
      );
    }

    if (status) {
      filteredProducts = filteredProducts.filter(
        (product) => product.status === status,
      );
    }

    const products = filteredProducts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20);

    return products;
  }

  async findManyWithDetails({ page, search, status }: FindMany) {
    let filteredProducts = this.items;

    if (search) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.title.includes(search) ||
          product.description.includes(search),
      );
    }

    if (status) {
      filteredProducts = filteredProducts.filter(
        (product) => product.status === status,
      );
    }

    const products = filteredProducts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20);

    const productsWithDetails = products.map((product) => {
      const seller = this.sellersRepository.items.find((seller) => {
        return seller.id.equals(product.ownerId);
      });

      if (!seller) {
        throw new Error(
          `owner with ID "${product.ownerId.toString()}" does not exist.`,
        );
      }

      const sellerAttachment = this.userAttachmentsRepository.items.find(
        (usertAttachment) => {
          return usertAttachment.userId.equals(product.id);
        },
      );

      let avatar: Attachment | null = null;

      if (sellerAttachment) {
        avatar =
          this.attachmentsRepository.items.find((attachment) => {
            return attachment.id.equals(sellerAttachment.attachmentId);
          }) || null;
      }

      const owner = UserWithAvatar.create({
        userId: seller.id,
        name: seller.name,
        phone: seller.phone,
        email: seller.email,
        password: seller.password,
        avatar,
      });

      const category = this.categoriesRepository.items.find((category) => {
        return category.id.equals(product.categoryId);
      });

      if (!category) {
        throw new Error(
          `category with ID "${product.categoryId.toString()}" does not exist.`,
        );
      }

      const productAttachments = this.productAttachmentsRepository.items.filter(
        (productAttachment) => {
          return productAttachment.productId.equals(product.id);
        },
      );

      const attachments = productAttachments.map((productAttachment) => {
        const attachment = this.attachmentsRepository.items.find(
          (attachment) => {
            return attachment.id.equals(productAttachment.attachmentId);
          },
        );

        if (!attachment) {
          throw new Error(
            `Attachment with ID "${productAttachment.attachmentId.toString()}" does not exist.`,
          );
        }

        return attachment;
      });

      return ProductDetails.create({
        productId: product.id,
        title: product.title,
        description: product.description,
        priceInCents: product.priceInCents,
        status: product.status,
        owner,
        category,
        attachments,
        createdAt: product.createdAt,
        statusAt: product.statusAt,
      });
    });

    return productsWithDetails;
  }

  async save(product: Product) {
    const itemIndex = this.items.findIndex((item) => item.id === product.id);

    this.items[itemIndex] = product;

    await this.productAttachmentsRepository.createMany(
      product.attachments.getNewItems(),
    );

    await this.productAttachmentsRepository.deleteMany(
      product.attachments.getRemovedItems(),
    );

    const productWithDetails = await this.findDetailsById(
      product.id.toString(),
    );

    if (!productWithDetails) {
      throw new Error(`product not created.`);
    }

    return productWithDetails;
  }

  async create(product: Product) {
    this.items.push(product);

    await this.productAttachmentsRepository.createMany(
      product.attachments.getItems(),
    );

    const productWithDetails = await this.findDetailsById(
      product.id.toString(),
    );

    if (!productWithDetails) {
      throw new Error(`product not created.`);
    }

    return productWithDetails;
  }
}
