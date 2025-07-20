import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Put,
} from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { EditSellerUseCase } from "@/domain/marketplace/application/use-cases/edit-seller";
import { EmailAlreadyExistsError } from "@/domain/marketplace/application/use-cases/errors/email-already-exists-error";
import { PhoneAlreadyExistsError } from "@/domain/marketplace/application/use-cases/errors/phone-already-exists-error";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { UserWithAvatarPresenter } from "../presenters/user-with-avatar-presenter";

const editSellerBodySchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  avatarId: z.string().uuid().optional(),
  password: z.string().min(1).optional(),
  newPassword: z.string().min(1).optional(),
});

const bodyValidationPipe = new ZodValidationPipe(editSellerBodySchema);

type EditSellerBodySchema = z.infer<typeof editSellerBodySchema>;

@Controller("/sellers")
export class EditSellerController {
  constructor(private editSeller: EditSellerUseCase) {}

  @Put()
  async handle(
    @Body(bodyValidationPipe) body: EditSellerBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { name, phone, email, avatarId, password, newPassword } = body;
    const userId = user.sub;

    const result = await this.editSeller.execute({
      sellerId: userId,
      name,
      phone,
      email,
      avatarId,
      password,
      newPassword,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case EmailAlreadyExistsError:
          throw new ConflictException(error.message);
        case PhoneAlreadyExistsError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const seller = result.value.seller;

    return { seller: UserWithAvatarPresenter.toHTTP(seller) };
  }
}
