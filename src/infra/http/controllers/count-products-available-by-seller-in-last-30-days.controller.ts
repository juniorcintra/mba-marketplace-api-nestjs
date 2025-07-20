import { BadRequestException, Controller, Get } from "@nestjs/common";
import { CountSellerProductsUseCase } from "@/domain/marketplace/application/use-cases/count-seller-products";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ProductStatus } from "@/domain/marketplace/enterprise/entities/product";

@Controller("/sellers/metrics/products/available")
export class CountProductsAvailableBySellerInLast30DaysController {
  constructor(
    private countProductsAvailableBySellerInLast30Days: CountSellerProductsUseCase,
  ) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const userId = user.sub;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result =
      await this.countProductsAvailableBySellerInLast30Days.execute({
        sellerId: userId,
        status: ProductStatus.AVAILABLE,
        from: thirtyDaysAgo,
      });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return result.value;
  }
}
