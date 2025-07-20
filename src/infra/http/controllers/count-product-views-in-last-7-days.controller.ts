import { BadRequestException, Controller, Get, Param } from "@nestjs/common";
import { CountProductViewsUseCase } from "@/domain/marketplace/application/use-cases/count-product-views";

@Controller("/products/:id/metrics/views")
export class CountProductViewsInLast7DaysController {
  constructor(private countProductViewsUseCase: CountProductViewsUseCase) {}

  @Get()
  async handle(@Param("id") id: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.countProductViewsUseCase.execute({
      productId: id,
      from: sevenDaysAgo,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    return result.value;
  }
}
