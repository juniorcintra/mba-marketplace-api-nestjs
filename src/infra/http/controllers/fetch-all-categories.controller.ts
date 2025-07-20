import { BadRequestException, Controller, Get } from "@nestjs/common";
import { FetchAllCategoriesUseCase } from "@/domain/marketplace/application/use-cases/fetch-all-categories";
import { CategoryPresenter } from "../presenters/category-presenter";
import { Public } from "@/infra/auth/public";

@Controller("/categories")
export class FetchAllCategoriesController {
  constructor(private fetchAllCategories: FetchAllCategoriesUseCase) {}

  @Get()
  @Public()
  async handle() {
    const result = await this.fetchAllCategories.execute();

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const categories = result.value.categories;

    return { categories: categories.map(CategoryPresenter.toHTTP) };
  }
}
