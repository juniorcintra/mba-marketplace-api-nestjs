import { Product } from "@/domain/marketplace/enterprise/entities/product";
import { ProductsRepository } from "../repositories/products-repository";
import { SellersRepository } from "../repositories/sellers-repository";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { ProductDetails } from "../../enterprise/entities/value-objects/product-details";

interface FetchProductsByOwnerIdUseCaseRequest {
  ownerId: string;
  search?: string;
  status?: Product["status"];
}

type FetchProductsByOwnerIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    products: ProductDetails[];
  }
>;

@Injectable()
export class FetchProductsByOwnerIdUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({
    ownerId,
    search,
    status,
  }: FetchProductsByOwnerIdUseCaseRequest): Promise<FetchProductsByOwnerIdUseCaseResponse> {
    const seller = await this.sellersRepository.findById(ownerId);

    if (!seller) {
      return left(new ResourceNotFoundError());
    }

    const products = await this.productsRepository.findManyWithDetailsByOwner({
      ownerId,
      search,
      status,
    });

    return right({
      products,
    });
  }
}
