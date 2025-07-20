import { EditProductUseCase } from "./edit-product";
import { InMemoryProductsRepository } from "test/repositories/in-memory-products-repository";
import { makeProduct } from "test/factories/make-product";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryCategoriesRepository } from "test/repositories/in-memory-categories-repository";
import { makeCategory } from "test/factories/make-category";
import { InMemorySellersRepository } from "test/repositories/in-memory-sellers-repository";
import { makeSeller } from "test/factories/make-seller";
import { ProductStatus } from "../../enterprise/entities/product";
import { NotAllowedError } from "./errors/not-allowed-error";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { InMemoryProductAttachmentsRepository } from "test/repositories/in-memory-product-attachments-repository";
import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { makeAttachment } from "test/factories/make-attachment";
import { ProductAttachmentList } from "../../enterprise/entities/product-attachment-list";
import { makeProductAttachment } from "test/factories/make-product-attachment";
import { InMemoryUserAttachmentsRepository } from "test/repositories/in-memory-user-attachments-repository";

let inMemoryUserAttachmentsRepository: InMemoryUserAttachmentsRepository;
let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
let inMemorySellersRepository: InMemorySellersRepository;
let inMemoryProductAttachmentsRepository: InMemoryProductAttachmentsRepository;
let inMemoryProductsRepository: InMemoryProductsRepository;
let inMemoryCategoriesRepository: InMemoryCategoriesRepository;
let sut: EditProductUseCase;

describe("Edit Product", () => {
  beforeEach(() => {
    inMemoryUserAttachmentsRepository = new InMemoryUserAttachmentsRepository();
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
    inMemoryCategoriesRepository = new InMemoryCategoriesRepository();
    inMemorySellersRepository = new InMemorySellersRepository(
      inMemoryUserAttachmentsRepository,
      inMemoryAttachmentsRepository,
    );
    inMemoryProductAttachmentsRepository =
      new InMemoryProductAttachmentsRepository();
    inMemoryProductsRepository = new InMemoryProductsRepository(
      inMemoryProductAttachmentsRepository,
      inMemoryUserAttachmentsRepository,
      inMemorySellersRepository,
      inMemoryCategoriesRepository,
      inMemoryAttachmentsRepository,
    );

    sut = new EditProductUseCase(
      inMemorySellersRepository,
      inMemoryProductsRepository,
      inMemoryCategoriesRepository,
      inMemoryAttachmentsRepository,
      inMemoryProductAttachmentsRepository,
    );
  });

  it("should be able to edit a product", async () => {
    await inMemoryAttachmentsRepository.createMany([
      makeAttachment({}, new UniqueEntityID("1")),
      makeAttachment({}, new UniqueEntityID("2")),
      makeAttachment({}, new UniqueEntityID("3")),
    ]);

    const productAttachmet1 = makeProductAttachment({
      attachmentId: new UniqueEntityID("1"),
      productId: new UniqueEntityID("product-1"),
    });

    const productAttachmet2 = makeProductAttachment({
      attachmentId: new UniqueEntityID("2"),
      productId: new UniqueEntityID("product-1"),
    });

    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category1 = makeCategory();
    await inMemoryCategoriesRepository.create(category1);

    const category2 = makeCategory();
    await inMemoryCategoriesRepository.create(category2);

    const product = makeProduct(
      {
        ownerId: seller.id,
        categoryId: category1.id,
        attachments: new ProductAttachmentList([
          productAttachmet1,
          productAttachmet2,
        ]),
      },
      new UniqueEntityID("product-1"),
    );

    await inMemoryProductsRepository.create(product);

    const result = await sut.execute({
      productId: product.id.toValue(),
      ownerId: product.ownerId.toValue(),
      title: "Produto editado",
      description: "Descriação editada",
      priceInCents: 123,
      categoryId: category2.id.toValue(),
      attachmentsIds: ["1", "3"],
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toMatchObject({
      product: expect.objectContaining({
        title: "Produto editado",
        description: "Descriação editada",
        priceInCents: 123,
        owner: expect.objectContaining({
          userId: seller.id,
          avatar: null,
        }),
        category: expect.objectContaining({
          id: category2.id,
        }),
        attachments: [
          expect.objectContaining({
            id: new UniqueEntityID("1"),
          }),
          expect.objectContaining({
            id: new UniqueEntityID("3"),
          }),
        ],
      }),
    });
  });

  it("should not be able to edit a product with a non-existent user", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    const product = makeProduct({
      ownerId: seller.id,
      categoryId: category.id,
    });
    await inMemoryProductsRepository.create(product);

    const result = await sut.execute({
      productId: product.id.toValue(),
      ownerId: "non-existent-user",
      title: "Produto editado",
      description: "Descriação editada",
      priceInCents: 123,
      categoryId: category.id.toValue(),
      attachmentsIds: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not be able to edit a product with a non-existent category", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    const product = makeProduct({
      ownerId: seller.id,
      categoryId: category.id,
    });

    await inMemoryProductsRepository.create(product);

    const result = await sut.execute({
      productId: product.id.toValue(),
      ownerId: product.ownerId.toValue(),
      title: "Produto editado",
      description: "Descriação editada",
      priceInCents: 123,
      categoryId: "non-existent-category",
      attachmentsIds: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not be able to edit a non-existent product", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    const product = makeProduct({
      ownerId: seller.id,
      categoryId: category.id,
    });

    await inMemoryProductsRepository.create(product);

    const result = await sut.execute({
      productId: "non-existent product",
      ownerId: product.ownerId.toValue(),
      title: "Produto editado",
      description: "Descriação editada",
      priceInCents: 123,
      categoryId: category.id.toValue(),
      attachmentsIds: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it("should not be able to edit a product from another user", async () => {
    const seller1 = makeSeller({}, new UniqueEntityID("owner-1"));
    await inMemorySellersRepository.create(seller1);

    const seller2 = makeSeller({}, new UniqueEntityID("owner-2"));
    await inMemorySellersRepository.create(seller2);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    const product = makeProduct({
      ownerId: new UniqueEntityID("owner-2"),
      categoryId: category.id,
    });

    await inMemoryProductsRepository.create(product);

    const result = await sut.execute({
      productId: product.id.toValue(),
      ownerId: "owner-1",
      title: "Produto editado",
      description: "Descriação editada",
      priceInCents: 123,
      categoryId: category.id.toValue(),
      attachmentsIds: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should not be able to edit a sold product", async () => {
    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    const product = makeProduct({
      ownerId: seller.id,
      categoryId: category.id,
      status: ProductStatus.SOLD,
    });

    await inMemoryProductsRepository.create(product);

    const result = await sut.execute({
      productId: product.id.toValue(),
      ownerId: product.ownerId.toValue(),
      title: "Produto editado",
      description: "Descriação editada",
      priceInCents: 123,
      categoryId: category.id.toValue(),
      attachmentsIds: [],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it("should sync new and removed attachment when editing a product", async () => {
    await inMemoryAttachmentsRepository.createMany([
      makeAttachment({}, new UniqueEntityID("1")),
      makeAttachment({}, new UniqueEntityID("2")),
      makeAttachment({}, new UniqueEntityID("3")),
    ]);

    const productAttachmet1 = makeProductAttachment({
      attachmentId: new UniqueEntityID("1"),
      productId: new UniqueEntityID("product-1"),
    });

    const productAttachmet2 = makeProductAttachment({
      attachmentId: new UniqueEntityID("2"),
      productId: new UniqueEntityID("product-1"),
    });

    const seller = makeSeller();
    await inMemorySellersRepository.create(seller);

    const category = makeCategory();
    await inMemoryCategoriesRepository.create(category);

    const product = makeProduct(
      {
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
      productId: product.id.toValue(),
      ownerId: product.ownerId.toValue(),
      title: "Produto editado",
      description: "Descriação editada",
      priceInCents: 123,
      categoryId: category.id.toValue(),
      attachmentsIds: ["1", "3"],
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryProductAttachmentsRepository.items).toHaveLength(2);
    expect(inMemoryProductAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attachmentId: new UniqueEntityID("1"),
        }),
        expect.objectContaining({
          attachmentId: new UniqueEntityID("3"),
        }),
      ]),
    );
  });
});
