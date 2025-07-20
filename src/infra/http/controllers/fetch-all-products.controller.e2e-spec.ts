import { ProductStatus } from "@/domain/marketplace/enterprise/entities/product";
import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { CategoryFactory } from "test/factories/make-category";
import { ProductFactory } from "test/factories/make-product";
import { SellerFactory } from "test/factories/make-seller";

describe("Fetch all products (E2E)", () => {
  let app: INestApplication;
  let sellerFactory: SellerFactory;
  let categoryFactory: CategoryFactory;
  let productFactory: ProductFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, CategoryFactory, ProductFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    sellerFactory = moduleRef.get(SellerFactory);
    categoryFactory = moduleRef.get(CategoryFactory);
    productFactory = moduleRef.get(ProductFactory);

    await app.init();
  });

  test("[GET] /products", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const category = await categoryFactory.makePrismaCategory();

    await Promise.all([
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 01",
        categoryId: category.id,
      }),
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 02",
        categoryId: category.id,
      }),
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 03",
        categoryId: category.id,
      }),
    ]);

    const response = await request(app.getHttpServer()).get("/products").send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      products: expect.arrayContaining(new Array(3)),
    });
    expect(response.body).toEqual({
      products: expect.arrayContaining([
        expect.objectContaining({ title: "Produto 01" }),
        expect.objectContaining({ title: "Produto 02" }),
        expect.objectContaining({ title: "Produto 02" }),
      ]),
    });
  });

  test("[GET] /products more recent first", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const category = await categoryFactory.makePrismaCategory();

    for (let i = 1; i <= 4; i++) {
      await productFactory.makePrismaProduct({
        ownerId: user.id,
        title: `Produto 0${i}`,
        categoryId: category.id,
        createdAt: i === 3 ? new Date() : new Date(`2024-10-0${i}`),
      });
    }

    const response = await request(app.getHttpServer()).get("/products").send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      products: expect.arrayContaining(new Array(3)),
    });
    expect(response.body.products[0]).toEqual(
      expect.objectContaining({ title: "Produto 03" }),
    );
  });

  test("[GET] /products paginated", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const category = await categoryFactory.makePrismaCategory();

    const now = new Date();
    const moreRecent = new Date();

    await Promise.all([
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 01",
        categoryId: category.id,
        createdAt: now,
      }),
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 02",
        status: ProductStatus.SOLD,
        categoryId: category.id,
        createdAt: now,
      }),
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 03",
        categoryId: category.id,
        createdAt: moreRecent,
      }),
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 04",
        categoryId: category.id,
        createdAt: now,
      }),
    ]);

    const queryParams = { page: "2" };

    const response = await request(app.getHttpServer())
      .get("/products")
      .query(queryParams)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      products: expect.arrayContaining(new Array(1)),
    });
    expect(response.body).toEqual({
      products: expect.arrayContaining([
        expect.objectContaining({ title: "Produto 03" }),
      ]),
    });
  });

  test("[GET] /products with status query param", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const category = await categoryFactory.makePrismaCategory();

    await Promise.all([
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 01",
        categoryId: category.id,
      }),
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 02",
        status: ProductStatus.SOLD,
        categoryId: category.id,
      }),
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 03",
        categoryId: category.id,
      }),
    ]);

    const queryParams = { status: "sold" };

    const response = await request(app.getHttpServer())
      .get("/products")
      .query(queryParams)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      products: expect.arrayContaining(new Array(1)),
    });
    expect(response.body).toEqual({
      products: expect.arrayContaining([
        expect.objectContaining({ title: "Produto 02" }),
      ]),
    });
  });

  test("[GET] /products with search query param", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const category = await categoryFactory.makePrismaCategory();

    await Promise.all([
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 01",
        categoryId: category.id,
      }),
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 02",
        categoryId: category.id,
      }),
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 03ABC",
        categoryId: category.id,
      }),
    ]);

    const queryParams = { search: "03ABC" };

    const response = await request(app.getHttpServer())
      .get("/products")
      .query(queryParams)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      products: expect.arrayContaining(new Array(1)),
    });
    expect(response.body).toEqual({
      products: expect.arrayContaining([
        expect.objectContaining({ title: "Produto 03ABC" }),
      ]),
    });
  });

  test("[GET] /products with status and search query params", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const category = await categoryFactory.makePrismaCategory();

    await Promise.all([
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 01",
        categoryId: category.id,
      }),
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 02",
        status: ProductStatus.SOLD,
        categoryId: category.id,
      }),
      productFactory.makePrismaProduct({
        ownerId: user.id,
        title: "Produto 03ABC",
        status: ProductStatus.SOLD,
        categoryId: category.id,
      }),
    ]);

    const queryParams = { status: "sold", search: "03ABC" };

    const response = await request(app.getHttpServer())
      .get("/products")
      .query(queryParams)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      products: expect.arrayContaining(new Array(1)),
    });
    expect(response.body).toEqual({
      products: expect.arrayContaining([
        expect.objectContaining({
          title: "Produto 03ABC",
          owner: expect.objectContaining({
            id: user.id.toString(),
          }),
          category: expect.objectContaining({
            id: category.id.toString(),
          }),
        }),
      ]),
    });
  });
});
