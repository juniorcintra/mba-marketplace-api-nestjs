import { GetSellerProfileUseCase } from "@/domain/marketplace/application/use-cases/get-seller-profile";
import { BadRequestException, Controller, Get } from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { UserWithAvatarPresenter } from "../presenters/user-with-avatar-presenter";

@Controller("/sellers/me")
export class GetSellerProfileController {
  constructor(private getSellerProfile: GetSellerProfileUseCase) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const userId = user.sub;

    const result = await this.getSellerProfile.execute({ id: userId });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return { seller: UserWithAvatarPresenter.toHTTP(result.value.seller) };
  }
}
