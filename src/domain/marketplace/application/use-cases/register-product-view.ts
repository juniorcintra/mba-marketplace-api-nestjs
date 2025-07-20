import { ProductsRepository } from "../repositories/products-repository";
import { ViewersRepository } from "../repositories/viewers-repository";
import { View } from "../../enterprise/entities/view";
import { ViewsRepository } from "../repositories/views-repository";
import { Either, left, right } from "@/core/either";
import { NotAllowedError } from "./errors/not-allowed-error";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { ViewDetails } from "../../enterprise/entities/value-objects/view-details";

interface RegisterProductViewUseCaseRequest {
  productId: string;
  viewerId: string;
}

type RegisterProductViewUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  ViewDetails
>;

@Injectable()
export class RegisterProductViewUseCase {
  constructor(
    private productsRepository: ProductsRepository,
    private viewersRepository: ViewersRepository,
    private viewsRepository: ViewsRepository,
  ) {}

  async execute({
    productId,
    viewerId,
  }: RegisterProductViewUseCaseRequest): Promise<RegisterProductViewUseCaseResponse> {
    const viewer = await this.viewersRepository.findById(viewerId);

    if (!viewer) {
      return left(new ResourceNotFoundError());
    }

    const product = await this.productsRepository.findById(productId);

    if (!product) {
      return left(new ResourceNotFoundError());
    }

    if (viewerId === product.ownerId.toString()) {
      return left(new NotAllowedError());
    }

    const view = View.create({
      product,
      viewer,
    });

    const isViewed = await this.viewsRepository.isViewed(view);

    if (isViewed) {
      return left(new NotAllowedError());
    }

    const viewDetails = await this.viewsRepository.create(view);

    return right(viewDetails);
  }
}
