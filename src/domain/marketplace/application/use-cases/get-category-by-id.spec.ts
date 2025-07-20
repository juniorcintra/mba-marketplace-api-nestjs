import { GetCategoryByIdUseCase } from "./get-category-by-id";
import { InMemoryCategoriesRepository } from "test/repositories/in-memory-categories-repository";
import { makeCategory } from "test/factories/make-category";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

let inMemoryCategoriesRepository: InMemoryCategoriesRepository;
let sut: GetCategoryByIdUseCase;

describe("Get Category by id", () => {
  beforeEach(() => {
    inMemoryCategoriesRepository = new InMemoryCategoriesRepository();
    sut = new GetCategoryByIdUseCase(inMemoryCategoriesRepository);
  });

  it("should be able to get a category by id", async () => {
    const newCategory = makeCategory({}, new UniqueEntityID("category-1"));

    await inMemoryCategoriesRepository.create(newCategory);

    const result = await sut.execute({
      id: "category-1",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      category: expect.objectContaining({
        id: newCategory.id,
        title: newCategory.title,
      }),
    });
  });
});
