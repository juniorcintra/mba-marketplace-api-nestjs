import { ProductsRepository } from "../repositories/products-repository";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { ProductDetails } from "../../enterprise/entities/value-objects/product-details";

interface GetProductByIdUseCaseRequest {
  id: string;
}

type GetProductByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    product: ProductDetails;
  }
>;

@Injectable()
export class GetProductByIdUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    id,
  }: GetProductByIdUseCaseRequest): Promise<GetProductByIdUseCaseResponse> {
    const product = await this.productsRepository.findDetailsById(id);

    if (!product) {
      return left(new ResourceNotFoundError());
    }

    return right({
      product,
    });
  }
}
