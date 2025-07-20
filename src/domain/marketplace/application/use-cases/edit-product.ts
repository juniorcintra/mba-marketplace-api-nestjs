import { ProductStatus } from "@/domain/marketplace/enterprise/entities/product";
import { ProductsRepository } from "../repositories/products-repository";
import { CategoriesRepository } from "../repositories/categories-repository";
import { SellersRepository } from "../repositories/sellers-repository";
import { NotAllowedError } from "./errors/not-allowed-error";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { AttachmentsRepository } from "../repositories/attachments-repository";
import { ProductAttachmentsRepository } from "../repositories/product-attachments-repository";
import { ProductAttachmentList } from "../../enterprise/entities/product-attachment-list";
import { ProductAttachment } from "../../enterprise/entities/product-attachment";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Injectable } from "@nestjs/common";
import { ProductDetails } from "../../enterprise/entities/value-objects/product-details";

interface EditProductUseCaseRequest {
  productId: string;
  ownerId: string;
  title: string;
  description: string;
  priceInCents: number;
  categoryId: string;
  attachmentsIds: string[];
}

type EditProductUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    product: ProductDetails;
  }
>;

@Injectable()
export class EditProductUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private productsRepository: ProductsRepository,
    private categoriesRepository: CategoriesRepository,
    private attachmentsRepository: AttachmentsRepository,
    private productAttachmentsRepository: ProductAttachmentsRepository,
  ) {}

  async execute({
    productId,
    ownerId,
    title,
    description,
    priceInCents,
    categoryId,
    attachmentsIds,
  }: EditProductUseCaseRequest): Promise<EditProductUseCaseResponse> {
    const seller = await this.sellersRepository.findById(ownerId);

    if (!seller) {
      return left(new ResourceNotFoundError());
    }

    const product = await this.productsRepository.findById(productId);

    if (!product) {
      return left(new ResourceNotFoundError());
    }

    if (seller.id.toString() !== product.ownerId.toString()) {
      return left(new NotAllowedError());
    }

    if (product.status === ProductStatus.SOLD) {
      return left(new NotAllowedError());
    }

    const category = await this.categoriesRepository.findById(categoryId);

    if (!category) {
      return left(new ResourceNotFoundError());
    }

    const attachments =
      await this.attachmentsRepository.findManyByIds(attachmentsIds);

    if (!attachments.hasAll) {
      return left(new ResourceNotFoundError());
    }

    const currentProductAttachments =
      await this.productAttachmentsRepository.findManyByProductId(productId);

    const productAttachmentList = new ProductAttachmentList(
      currentProductAttachments,
    );

    const productAttachments = attachmentsIds.map((attachmentId) => {
      return ProductAttachment.create({
        attachmentId: new UniqueEntityID(attachmentId),
        productId: product.id,
      });
    });

    productAttachmentList.update(productAttachments);

    product.title = title;
    product.description = description;
    product.priceInCents = priceInCents;
    product.categoryId = category.id;
    product.attachments = productAttachmentList;

    const productWithDetails = await this.productsRepository.save(product);

    return right({
      product: productWithDetails,
    });
  }
}
