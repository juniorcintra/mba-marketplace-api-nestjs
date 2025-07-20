import { Category } from "@/domain/marketplace/enterprise/entities/category";
import { CategoriesRepository } from "../repositories/categories-repository";
import { Either, right } from "@/core/either";
import { Injectable } from "@nestjs/common";

type FetchAllCategoriesUseCaseResponse = Either<
  null,
  {
    categories: Category[];
  }
>;

@Injectable()
export class FetchAllCategoriesUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute(): Promise<FetchAllCategoriesUseCaseResponse> {
    const categories = await this.categoriesRepository.listAll();

    return right({
      categories,
    });
  }
}
