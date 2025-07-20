import { BadRequestException, Controller, Get } from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { CountSellerViewsUseCase } from "@/domain/marketplace/application/use-cases/count-seller-views";

@Controller("/sellers/metrics/views")
export class CountSellerViewsInLast30DaysController {
  constructor(private countSellerViewsUseCase: CountSellerViewsUseCase) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const userId = user.sub;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.countSellerViewsUseCase.execute({
      sellerId: userId,
      from: thirtyDaysAgo,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return result.value;
  }
}
