import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Param,
  Put,
} from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { EditProductUseCase } from "@/domain/marketplace/application/use-cases/edit-product";
import { NotAllowedError } from "@/domain/marketplace/application/use-cases/errors/not-allowed-error";
import { ProductDetailsPresenter } from "../presenters/product-details-presenter";

const editProductBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  priceInCents: z.number(),
  categoryId: z.string().uuid(),
  attachmentsIds: z.array(z.string().uuid()),
});

const bodyValidationPipe = new ZodValidationPipe(editProductBodySchema);

type EditProductBodySchema = z.infer<typeof editProductBodySchema>;

@Controller("/products/:id")
export class EditProductController {
  constructor(private editProductUseCase: EditProductUseCase) {}

  @Put()
  async handle(
    @Body(bodyValidationPipe) body: EditProductBodySchema,
    @CurrentUser() user: UserPayload,
    @Param("id") productId: string,
  ) {
    const { title, categoryId, description, priceInCents, attachmentsIds } =
      body;
    const userId = user.sub;

    const result = await this.editProductUseCase.execute({
      productId,
      ownerId: userId,
      title,
      description,
      priceInCents,
      categoryId,
      attachmentsIds,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    return { product: ProductDetailsPresenter.toHTTP(result.value.product) };
  }
}
