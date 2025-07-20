import { BadRequestException, Controller, Get } from "@nestjs/common";
import { CountSellerProductsUseCase } from "@/domain/marketplace/application/use-cases/count-seller-products";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ProductStatus } from "@/domain/marketplace/enterprise/entities/product";

@Controller("/sellers/metrics/products/sold")
export class CountProductsSoldBySellerInLast30DaysController {
  constructor(
    private countProductsSoldBySellerInLast30Days: CountSellerProductsUseCase,
  ) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const userId = user.sub;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.countProductsSoldBySellerInLast30Days.execute({
      sellerId: userId,
      status: ProductStatus.SOLD,
      from: thirtyDaysAgo,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return result.value;
  }
}
