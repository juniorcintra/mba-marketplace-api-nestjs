import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { FetchAllProductsUseCase } from "@/domain/marketplace/application/use-cases/fetch-all-products";
import { ProductStatus } from "@/domain/marketplace/enterprise/entities/product";
import { Public } from "@/infra/auth/public";
import { ProductDetailsPresenter } from "../presenters/product-details-presenter";

const queryParamSchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((value) => {
      const numberValue = Number(value);
      if (isNaN(numberValue)) {
        throw new Error("Page must be a valid number");
      }
      return numberValue;
    })
    .pipe(z.number().min(1, { message: "Page must be at least 1" })),
  search: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
});

const queryValidationPipe = new ZodValidationPipe(queryParamSchema);

type QueryParamSchema = z.infer<typeof queryParamSchema>;

@Controller("/products")
export class FetchAllProductsController {
  constructor(private fetchAllProductsUseCase: FetchAllProductsUseCase) {}

  @Get()
  @Public()
  async handle(
    @Query(queryValidationPipe)
    { page, search, status }: QueryParamSchema,
  ) {
    const result = await this.fetchAllProductsUseCase.execute({
      page,
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
