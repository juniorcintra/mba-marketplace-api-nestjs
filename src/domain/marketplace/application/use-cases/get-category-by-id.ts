import { Category } from "@/domain/marketplace/enterprise/entities/category";
import { CategoriesRepository } from "../repositories/categories-repository";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface GetCategoryByIdUseCaseRequest {
  id: string;
}

type GetCategoryByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    category: Category;
  }
>;

export class GetCategoryByIdUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({
    id,
  }: GetCategoryByIdUseCaseRequest): Promise<GetCategoryByIdUseCaseResponse> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      return left(new ResourceNotFoundError());
    }

    return right({
      category,
    });
  }
}
