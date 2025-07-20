import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { CreateProductUseCase } from "@/domain/marketplace/application/use-cases/create-product";
import { ProductDetailsPresenter } from "../presenters/product-details-presenter";

const createProductBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  priceInCents: z.number(),
  categoryId: z.string().uuid(),
  attachmentsIds: z.array(z.string().uuid()),
});

const bodyValidationPipe = new ZodValidationPipe(createProductBodySchema);

type CreateProductBodySchema = z.infer<typeof createProductBodySchema>;

@Controller("/products")
export class CreateProductController {
  constructor(private createProductUseCase: CreateProductUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateProductBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, categoryId, description, priceInCents, attachmentsIds } =
      body;
    const userId = user.sub;

    const result = await this.createProductUseCase.execute({
      ownerId: userId,
      title,
      description,
      priceInCents,
      categoryId,
      attachmentsIds,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return { product: ProductDetailsPresenter.toHTTP(result.value.product) };
  }
}
