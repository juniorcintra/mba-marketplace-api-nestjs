import { Product } from "@/domain/marketplace/enterprise/entities/product";
import { ProductsRepository } from "../repositories/products-repository";
import { SellersRepository } from "../repositories/sellers-repository";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";

interface CountSellerProductsUseCaseRequest {
  sellerId: string;
  status?: Product["status"];
  from?: Date;
}

type CountSellerProductsUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    amount: number;
  }
>;

@Injectable()
export class CountSellerProductsUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({
    sellerId,
    status,
    from,
  }: CountSellerProductsUseCaseRequest): Promise<CountSellerProductsUseCaseResponse> {
    const seller = await this.sellersRepository.findById(sellerId);

    if (!seller) {
      return left(new ResourceNotFoundError());
    }

    const amount = await this.productsRepository.count({
      sellerId,
      status,
      from,
    });

    return right({
      amount,
    });
  }
}
