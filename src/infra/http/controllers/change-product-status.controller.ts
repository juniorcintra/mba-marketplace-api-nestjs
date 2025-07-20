import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Param,
  Patch,
} from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { ChangeProductStatusUseCase } from "@/domain/marketplace/application/use-cases/change-product-status";
import { NotAllowedError } from "@/domain/marketplace/application/use-cases/errors/not-allowed-error";
import { ProductStatus } from "@/domain/marketplace/enterprise/entities/product";
import { ProductDetailsPresenter } from "../presenters/product-details-presenter";

const changeProductStatusPathSchema = z.object({
  id: z.string().uuid(),
  status: z.nativeEnum(ProductStatus),
});

const pathValidationPipe = new ZodValidationPipe(changeProductStatusPathSchema);

type ChangeProductStatusPathSchema = z.infer<
  typeof changeProductStatusPathSchema
>;

@Controller("/products/:id/:status")
export class ChangeProductStatusController {
  constructor(private changeProductStatusUseCase: ChangeProductStatusUseCase) {}

  @Patch()
  async handle(
    @CurrentUser() user: UserPayload,
    @Param(pathValidationPipe) path: ChangeProductStatusPathSchema,
  ) {
    const { id, status } = path;
    const userId = user.sub;

    const result = await this.changeProductStatusUseCase.execute({
      productId: id,
      ownerId: userId,
      newStatus: status,
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
