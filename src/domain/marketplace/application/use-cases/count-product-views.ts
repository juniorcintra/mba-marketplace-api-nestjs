import { ViewsRepository } from "../repositories/views-repository";
import { ProductsRepository } from "../repositories/products-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";

interface CountProductViewsUseCaseRequest {
  productId: string;
  from?: Date;
}

type CountProductViewsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    amount: number;
  }
>;

@Injectable()
export class CountProductViewsUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private viewsRepository: ViewsRepository,
  ) {}

  async execute({
    productId,
    from,
  }: CountProductViewsUseCaseRequest): Promise<CountProductViewsUseCaseResponse> {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      return left(new ResourceNotFoundError());
    }

    const sellerId = product.ownerId.toString();

    const amount = await this.viewsRepository.count({
      sellerId,
      productId,
      from,
    });

    return right({
      amount,
    });
  }
}
