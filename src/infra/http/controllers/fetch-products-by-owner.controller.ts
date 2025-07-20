import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { ProductStatus } from "@/domain/marketplace/enterprise/entities/product";
import { FetchProductsByOwnerIdUseCase } from "@/domain/marketplace/application/use-cases/fetch-products-by-owner";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ProductDetailsPresenter } from "../presenters/product-details-presenter";

const queryParamSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
});

const queryValidationPipe = new ZodValidationPipe(queryParamSchema);

type QueryParamSchema = z.infer<typeof queryParamSchema>;

@Controller("/products/me")
export class FetchProductsByOwnerController {
  constructor(
    private fetchProductsByOwnerIdUseCase: FetchProductsByOwnerIdUseCase,
  ) {}

  @Get()
  async handle(
    @CurrentUser() user: UserPayload,
    @Query(queryValidationPipe)
    { search, status }: QueryParamSchema,
  ) {
    const userId = user.sub;

    const result = await this.fetchProductsByOwnerIdUseCase.execute({
      ownerId: userId,
      search,
      status,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const products = result.value.products;

    return { products: products.map(ProductDetailsPresenter.toHTTP) };
  }
}
