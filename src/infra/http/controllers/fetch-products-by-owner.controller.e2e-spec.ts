import { ProductStatus } from "@/domain/marketplace/enterprise/entities/product";
import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { CategoryFactory } from "test/factories/make-category";
import { ProductFactory } from "test/factories/make-product";
import { SellerFactory } from "test/factories/make-seller";

describe("Fetch products by owner (E2E)", () => {
  let app: INestApplication;
  let sellerFactory: SellerFactory;
  let categoryFactory: CategoryFactory;
  let productFactory: ProductFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, CategoryFactory, ProductFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    sellerFactory = moduleRef.get(SellerFactory);
    categoryFactory = moduleRef.get(CategoryFactory);
    productFactory = moduleRef.get(ProductFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[GET] /products/me", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

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

    const response = await request(app.getHttpServer())
      .get("/products/me")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send();

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

  test("[GET] /products/me with status query param", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

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
      .get("/products/me")
      .set("Cookie", [`accessToken=${accessToken}`])
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

  test("[GET] /products/me with search query param", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

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
      .get("/products/me")
      .set("Cookie", [`accessToken=${accessToken}`])
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

  test("[GET] /products/me with status and search query params", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

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
      .get("/products/me")
      .set("Cookie", [`accessToken=${accessToken}`])
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
