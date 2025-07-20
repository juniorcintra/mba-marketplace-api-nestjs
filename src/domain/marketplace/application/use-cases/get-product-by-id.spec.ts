import { GetProductByIdUseCase } from "./get-product-by-id";
import { InMemoryProductsRepository } from "test/repositories/in-memory-products-repository";
import { makeProduct } from "test/factories/make-product";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryProductAttachmentsRepository } from "test/repositories/in-memory-product-attachments-repository";
import { InMemorySellersRepository } from "test/repositories/in-memory-sellers-repository";
import { InMemoryCategoriesRepository } from "test/repositories/in-memory-categories-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { InMemoryUserAttachmentsRepository } from "test/repositories/in-memory-user-attachments-repository";
import { makeSeller } from "test/factories/make-seller";
import { makeCategory } from "test/factories/make-category";
import { makeAttachment } from "test/factories/make-attachment";
import { makeProductAttachment } from "test/factories/make-product-attachment";
import { ProductAttachmentList } from "../../enterprise/entities/product-attachment-list";

let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemorySellersRepository: InMemorySellersRepository;
let inMemoryCategoriesRepository: InMemoryCategoriesRepository;
let inMemoryProductAttachmentsRepository: InMemoryProductAttachmentsRepository;
let inMemoryProductsRepository: InMemoryProductsRepository;
let sut: GetProductByIdUseCase;

describe("Get Product by id", () => {
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
    sut = new GetProductByIdUseCase(inMemoryProductsRepository);
  });

  it("should be able to get a product by id", async () => {
    const seller = makeSeller({}, new UniqueEntityID("seller-1"));
    await inMemorySellersRepository.create(seller);

    const category = makeCategory({}, new UniqueEntityID("category-1"));
    await inMemoryCategoriesRepository.create(category);

    await inMemoryAttachmentsRepository.createMany([
      makeAttachment({}, new UniqueEntityID("1")),
      makeAttachment({}, new UniqueEntityID("2")),
    ]);

    const productAttachmet1 = makeProductAttachment({
      attachmentId: new UniqueEntityID("1"),
      productId: new UniqueEntityID("product-1"),
    });

    const productAttachmet2 = makeProductAttachment({
      attachmentId: new UniqueEntityID("2"),
      productId: new UniqueEntityID("product-1"),
    });

    const product = makeProduct(
      {
        title: "Product title",
        ownerId: seller.id,
        categoryId: category.id,
        attachments: new ProductAttachmentList([
          productAttachmet1,
          productAttachmet2,
        ]),
      },
      new UniqueEntityID("product-1"),
    );

    await inMemoryProductsRepository.create(product);

    const result = await sut.execute({
      id: "product-1",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      product: expect.objectContaining({
        title: product.title,
        owner: expect.objectContaining({
          userId: seller.id,
          avatar: null,
        }),
        category: expect.objectContaining({
          id: category.id,
        }),
        attachments: [
          expect.objectContaining({
            id: productAttachmet1.attachmentId,
          }),
          expect.objectContaining({
            id: productAttachmet2.attachmentId,
          }),
        ],
      }),
    });
  });
});
