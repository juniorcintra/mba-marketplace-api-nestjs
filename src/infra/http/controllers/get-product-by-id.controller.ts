import { GetProductByIdUseCase } from "@/domain/marketplace/application/use-cases/get-product-by-id";
import { BadRequestException, Controller, Get, Param } from "@nestjs/common";
import { Public } from "@/infra/auth/public";
import { ProductDetailsPresenter } from "../presenters/product-details-presenter";

@Controller("/products/:id")
@Public()
export class GetProductByIdController {
  constructor(private getProductById: GetProductByIdUseCase) {}

  @Get()
  async handle(@Param("id") id: string) {
    const result = await this.getProductById.execute({ id });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return { product: ProductDetailsPresenter.toHTTP(result.value.product) };
  }
}
