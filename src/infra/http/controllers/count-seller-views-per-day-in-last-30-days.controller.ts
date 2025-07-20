import { BadRequestException, Controller, Get } from "@nestjs/common";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { CountSellerViewsPerDayUseCase } from "@/domain/marketplace/application/use-cases/count-seller-views-per-day";

@Controller("/sellers/metrics/views/days")
export class CountSellerViewsPerDayInLast30DaysController {
  constructor(
    private countSellerViewsPerDayUseCase: CountSellerViewsPerDayUseCase,
  ) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const userId = user.sub;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.countSellerViewsPerDayUseCase.execute({
      sellerId: userId,
      from: thirtyDaysAgo,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return result.value;
  }
}
