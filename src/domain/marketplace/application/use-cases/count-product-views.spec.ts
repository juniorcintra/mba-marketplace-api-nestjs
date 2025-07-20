import { CountProductViewsUseCase } from "./count-product-views";
import { InMemoryViewsRepository } from "test/repositories/in-memory-views-repository";
import { makeView } from "test/factories/make-view";
import { InMemoryProductsRepository } from "test/repositories/in-memory-products-repository";
import { makeProduct } from "test/factories/make-product";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { InMemoryProductAttachmentsRepository } from "test/repositories/in-memory-product-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemorySellersRepository } from "test/repositories/in-memory-sellers-repository";
import { InMemoryCategoriesRepository } from "test/repositories/in-memory-categories-repository";
import { InMemoryUserAttachmentsRepository } from "test/repositories/in-memory-user-attachments-repository";
import { makeSeller } from "test/factories/make-seller";
import { makeCategory } from "test/factories/make-category";
import { InMemoryViewersRepository } from "test/repositories/in-memory-viewers-repository";
import { makeViewer } from "test/factories/make-viewer";

let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemorySellersRepository: InMemorySellersRepository;
let inMemoryCategoriesRepository: InMemoryCategoriesRepository;
let inMemoryProductAttachmentsRepository: InMemoryProductAttachmentsRepository;
let inMemoryProductsRepository: InMemoryProductsRepository;
let inMemoryViewersRepository: InMemoryViewersRepository;
let inMemoryViewsRepository: InMemoryViewsRepository;
let sut: CountProductViewsUseCase;

describe("Count Product Views", () => {
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
    inMemoryViewersRepository = new InMemoryViewersRepository(
      inMemoryUserAttachmentsRepository,
      inMemoryAttachmentsRepository,
    );
    inMemoryViewsRepository = new InMemoryViewsRepository(
      inMemoryProductsRepository,
      inMemoryViewersRepository,
    );
    sut = new CountProductViewsUseCase(
      inMemoryProductsRepository,
      inMemoryViewsRepository,
    );
  });

  it("should be able to count the views received by the product in the last 7 days", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    const product = makeProduct({
      ownerId: seller.id,
      categoryId: category.id,
    });
    await inMemoryProductsRepository.create(product);

    const viewer = makeViewer();
    await inMemoryViewersRepository.create(viewer);

    for (let i = 1; i <= 10; i++) {
      const fakerCreatedAt = new Date();
      fakerCreatedAt.setDate(fakerCreatedAt.getDate() - i);

      const view = makeView({
        product,
        viewer,
        createdAt: fakerCreatedAt,
      });

      await inMemoryViewsRepository.create(view);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const result = await sut.execute({
      productId: product.id.toValue(),
      from: sevenDaysAgo,
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      amount: 7,
    });
  });

  it("should not be able to count views of a non-existent product", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    const product = makeProduct({
      ownerId: seller.id,
      categoryId: category.id,
    });
    await inMemoryProductsRepository.create(product);

    const viewer = makeViewer();
    await inMemoryViewersRepository.create(viewer);

    const view = makeView({ product, viewer });
    await inMemoryViewsRepository.create(view);

    const result = await sut.execute({
      productId: "product-1",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
