import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { RegisterSellerUseCase } from "@/domain/marketplace/application/use-cases/register-seller";
import { EmailAlreadyExistsError } from "@/domain/marketplace/application/use-cases/errors/email-already-exists-error";
import { PhoneAlreadyExistsError } from "@/domain/marketplace/application/use-cases/errors/phone-already-exists-error";
import { Public } from "@/infra/auth/public";
import { UserWithAvatarPresenter } from "../presenters/user-with-avatar-presenter";

const registerSellerBodySchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  avatarId: z.string().uuid().nullable(),
  password: z.string(),
  passwordConfirmation: z.string(),
});

type RegisterSellerBodySchema = z.infer<typeof registerSellerBodySchema>;

@Controller("/sellers")
@Public()
export class RegisterSellerController {
  constructor(private registerSeller: RegisterSellerUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(registerSellerBodySchema))
  async handle(@Body() body: RegisterSellerBodySchema) {
    const { name, phone, email, avatarId, password, passwordConfirmation } =
      body;

    const result = await this.registerSeller.execute({
      name,
      phone,
      email,
      avatarId,
      password,
      passwordConfirmation,
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
