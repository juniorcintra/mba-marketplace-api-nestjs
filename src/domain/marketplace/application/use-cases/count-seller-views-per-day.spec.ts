import { CountSellerViewsPerDayUseCase } from "./count-seller-views-per-day";
import { InMemoryViewsRepository } from "test/repositories/in-memory-views-repository";
import { makeView } from "test/factories/make-view";
import { InMemorySellersRepository } from "test/repositories/in-memory-sellers-repository";
import { makeSeller } from "test/factories/make-seller";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { InMemoryUserAttachmentsRepository } from "test/repositories/in-memory-user-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemoryViewersRepository } from "test/repositories/in-memory-viewers-repository";
import { InMemoryProductsRepository } from "test/repositories/in-memory-products-repository";
import { InMemoryCategoriesRepository } from "test/repositories/in-memory-categories-repository";
import { InMemoryProductAttachmentsRepository } from "test/repositories/in-memory-product-attachments-repository";
import { makeViewer } from "test/factories/make-viewer";
import { makeCategory } from "test/factories/make-category";
import { makeProduct } from "test/factories/make-product";

let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemorySellersRepository: InMemorySellersRepository;
let inMemoryCategoriesRepository: InMemoryCategoriesRepository;
let inMemoryProductAttachmentsRepository: InMemoryProductAttachmentsRepository;
let inMemoryProductsRepository: InMemoryProductsRepository;
let inMemoryViewersRepository: InMemoryViewersRepository;
let inMemoryViewsRepository: InMemoryViewsRepository;
let sut: CountSellerViewsPerDayUseCase;

describe("Count Seller Views per day", () => {
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
    sut = new CountSellerViewsPerDayUseCase(
      inMemorySellersRepository,
      inMemoryViewsRepository,
    );
  });

  it("should be able to count the views per day received by the seller in the last 30 days", async () => {
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

    const baseView = makeView({
      product,
      viewer,
      createdAt: new Date("1900-01-01"),
    });

    for (let i = 1; i <= 50; i++) {
      const fakerCreatedAt = new Date();
      fakerCreatedAt.setDate(fakerCreatedAt.getDate() - i * 2);

      const view = makeView({
        product: baseView.product,
        viewer: baseView.viewer,
        createdAt: fakerCreatedAt,
      });

      await inMemoryViewsRepository.create(view);
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oneMoreView = makeView({
      product: baseView.product,
      viewer: baseView.viewer,
      createdAt: thirtyDaysAgo,
    });
    await inMemoryViewsRepository.create(oneMoreView);

    const result = await sut.execute({
      sellerId: seller.id.toValue(),
      from: thirtyDaysAgo,
    });

    expect(result.value).toMatchObject({
      viewsPerDay: expect.arrayContaining(new Array(15)),
    });
    expect(result.value).toMatchObject({
      viewsPerDay: expect.arrayContaining([
        expect.objectContaining({
          date: new Date(
            new Date(new Date(thirtyDaysAgo).setHours(0, 0, 0, 0))
              .toISOString()
              .split("T")[0],
          ),
          amount: 2,
        }),
      ]),
    });
  });

  it("should not be able to count views of a non-existent seller", async () => {
    const result = await sut.execute({
      sellerId: "seller-1",
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
