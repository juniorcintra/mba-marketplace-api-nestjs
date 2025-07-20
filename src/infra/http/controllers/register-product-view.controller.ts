import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Param,
  Post,
} from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { RegisterProductViewUseCase } from "@/domain/marketplace/application/use-cases/register-product-view";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { NotAllowedError } from "@/domain/marketplace/application/use-cases/errors/not-allowed-error";
import { ViewDetailsPresenter } from "../presenters/view-details-presenter";

const registerProductViewPathSchema = z.object({
  id: z.string().uuid(),
});

const pathValidationPipe = new ZodValidationPipe(registerProductViewPathSchema);

type RegisterProductViewPathSchema = z.infer<
  typeof registerProductViewPathSchema
>;

@Controller("/products/:id/views")
export class RegisterProductViewController {
  constructor(private registerProductView: RegisterProductViewUseCase) {}

  @Post()
  async handle(
    @CurrentUser() user: UserPayload,
    @Param(pathValidationPipe) path: RegisterProductViewPathSchema,
  ) {
    const { id } = path;
    const userId = user.sub;

    const result = await this.registerProductView.execute({
      productId: id,
      viewerId: userId,
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

    return ViewDetailsPresenter.toHTTP(result.value);
  }
}
