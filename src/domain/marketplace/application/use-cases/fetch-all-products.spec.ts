import { InMemoryProductsRepository } from "test/repositories/in-memory-products-repository";
import { makeProduct } from "test/factories/make-product";
import { FetchAllProductsUseCase } from "./fetch-all-products";
import { ProductStatus } from "../../enterprise/entities/product";
import { InMemoryProductAttachmentsRepository } from "test/repositories/in-memory-product-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemorySellersRepository } from "test/repositories/in-memory-sellers-repository";
import { InMemoryCategoriesRepository } from "test/repositories/in-memory-categories-repository";
import { InMemoryUserAttachmentsRepository } from "test/repositories/in-memory-user-attachments-repository";
import { makeSeller } from "test/factories/make-seller";
import { makeCategory } from "test/factories/make-category";

let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemorySellersRepository: InMemorySellersRepository;
let inMemoryCategoriesRepository: InMemoryCategoriesRepository;
let inMemoryProductAttachmentsRepository: InMemoryProductAttachmentsRepository;
let inMemoryProductsRepository: InMemoryProductsRepository;
let sut: FetchAllProductsUseCase;

describe("Fetch All Products", () => {
  beforeEach(() => {
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository();
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
      inMemoryAttachmentsRepository,
    );
    inMemoryCategoriesRepository = new InMemoryCategoriesRepository();
    inMemoryProductAttachmentsRepository =
      new InMemoryProductAttachmentsRepository();
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachmentsRepository,
      inMemoryUserAttachmentsRepository,
      inMemorySellersRepository,
      inMemoryCategoriesRepository,
      inMemoryAttachmentsRepository,
    );
    sut = new FetchAllProductsUseCase(inMemoryProductsRepository);
  });

  it("should be able to fetch all products", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    await inMemoryProductsRepository.create(
      makeProduct({
        ownerId: seller.id,
        categoryId: category.id,
        createdAt: new Date(2024, 11, 20),
      }),
    );
    await inMemoryProductsRepository.create(
      makeProduct({
        ownerId: seller.id,
        categoryId: category.id,
        createdAt: new Date(2024, 11, 18),
      }),
    );
    await inMemoryProductsRepository.create(
      makeProduct({
        ownerId: seller.id,
        categoryId: category.id,
        createdAt: new Date(2024, 11, 23),
      }),
    );

    const result = await sut.execute({
      page: 1,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.products).toEqual([
      expect.objectContaining({ createdAt: new Date(2024, 11, 23) }),
      expect.objectContaining({ createdAt: new Date(2024, 11, 20) }),
      expect.objectContaining({ createdAt: new Date(2024, 11, 18) }),
    ]);
  });

  it("should be able to fetch paginated all products", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    for (let i = 1; i <= 22; i++) {
      await inMemoryProductsRepository.create(
        makeProduct({ ownerId: seller.id, categoryId: category.id }),
      );
    }

    const result = await sut.execute({
      page: 2,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.products).toHaveLength(2);
  });

  it("should be able to fetch filtered products by title or description", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    await inMemoryProductsRepository.create(
      makeProduct({
        ownerId: seller.id,
        title: "Produto 1",
        description: "Descrição 123",
        categoryId: category.id,
        createdAt: new Date(2024, 11, 20),
      }),
    );
    await inMemoryProductsRepository.create(
      makeProduct({
        ownerId: seller.id,
        title: "Produto 2",
        description: "Descrição 456",
        categoryId: category.id,
        createdAt: new Date(2024, 11, 18),
      }),
    );
    await inMemoryProductsRepository.create(
      makeProduct({
        ownerId: seller.id,
        title: "Produto 3",
        description: "Descrição 789",
        categoryId: category.id,
        createdAt: new Date(2024, 11, 23),
      }),
    );

    const result = await sut.execute({
      page: 1,
      search: "2",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.products).toEqual([
      expect.objectContaining({
        title: "Produto 1",
        description: "Descrição 123",
        createdAt: new Date(2024, 11, 20),
      }),
      expect.objectContaining({
        title: "Produto 2",
        description: "Descrição 456",
        createdAt: new Date(2024, 11, 18),
      }),
    ]);
  });

  it("should be able to fetch filtered products by status", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    await inMemoryProductsRepository.create(
      makeProduct({
        ownerId: seller.id,
        categoryId: category.id,
        status: ProductStatus.AVAILABLE,
        createdAt: new Date(2024, 11, 20),
      }),
    );
    await inMemoryProductsRepository.create(
      makeProduct({
        ownerId: seller.id,
        categoryId: category.id,
        status: ProductStatus.SOLD,
        createdAt: new Date(2024, 11, 18),
      }),
    );
    await inMemoryProductsRepository.create(
      makeProduct({
        ownerId: seller.id,
        categoryId: category.id,
        status: ProductStatus.AVAILABLE,
        createdAt: new Date(2024, 11, 23),
      }),
    );

    const result = await sut.execute({
      page: 1,
      status: ProductStatus.AVAILABLE,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.products).toEqual([
      expect.objectContaining({
        status: ProductStatus.AVAILABLE,
        createdAt: new Date(2024, 11, 23),
      }),
      expect.objectContaining({
        status: ProductStatus.AVAILABLE,
        createdAt: new Date(2024, 11, 20),
      }),
    ]);
  });

  it("should be able to fetch filtered products by title or description and status", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    await inMemoryProductsRepository.create(
      makeProduct({
        ownerId: seller.id,
        title: "Produto 1",
        description: "Descrição 123",
        categoryId: category.id,
        status: ProductStatus.AVAILABLE,
        createdAt: new Date(2024, 11, 20),
      }),
    );
    await inMemoryProductsRepository.create(
      makeProduct({
        ownerId: seller.id,
        title: "Produto 2",
        description: "Descrição 456",
        categoryId: category.id,
        status: ProductStatus.SOLD,
        createdAt: new Date(2024, 11, 18),
      }),
    );
    await inMemoryProductsRepository.create(
      makeProduct({
        ownerId: seller.id,
        title: "Produto 3",
        description: "Descrição 789",
        categoryId: category.id,
        status: ProductStatus.CANCELLED,
        createdAt: new Date(2024, 11, 23),
      }),
    );

    const result = await sut.execute({
      page: 1,
      search: "2",
      status: ProductStatus.AVAILABLE,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value?.products).toEqual([
      expect.objectContaining({
        title: "Produto 1",
        description: "Descrição 123",
        owner: expect.objectContaining({
          userId: seller.id,
          avatar: null,
        }),
        category: expect.objectContaining({
          id: category.id,
        }),
        attachments: [],
        status: ProductStatus.AVAILABLE,
        createdAt: new Date(2024, 11, 20),
      }),
    ]);
  });
});
