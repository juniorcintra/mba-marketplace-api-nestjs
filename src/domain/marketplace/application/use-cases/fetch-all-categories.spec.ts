import { InMemoryCategoriesRepository } from "test/repositories/in-memory-categories-repository";
import { FetchAllCategoriesUseCase } from "./fetch-all-categories";
import { makeCategory } from "test/factories/make-category";

let inMemoryCategoriesRepository: InMemoryCategoriesRepository;
let sut: FetchAllCategoriesUseCase;

describe("Fetch all Categories", () => {
  beforeEach(() => {
    inMemoryCategoriesRepository = new InMemoryCategoriesRepository();
    sut = new FetchAllCategoriesUseCase(inMemoryCategoriesRepository);
  });

  it("should be able to fetch all categories", async () => {
    for (let i = 0; i < 20; i++) {
      await inMemoryCategoriesRepository.create(makeCategory());
    }

    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    expect(result.value?.categories).toHaveLength(20);
  });
});
