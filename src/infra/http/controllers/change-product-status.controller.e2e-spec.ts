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

describe("Change Product status (E2E)", () => {
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

  test("[PATCH] /products/:id", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const category = await categoryFactory.makePrismaCategory();

    const product = await productFactory.makePrismaProduct({
      ownerId: user.id,
      categoryId: category.id,
    });

    const newStatus = ProductStatus.SOLD;

    const productId = product.id.toString();
    const response = await request(app.getHttpServer())
      .patch(`/products/${productId}/${newStatus}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      product: expect.objectContaining({
        id: product.id.toString(),
        title: product.title,
        description: product.description,
        priceInCents: product.priceInCents,
        status: newStatus,
        owner: expect.objectContaining({
          id: user.id.toString(),
          email: user.email,
          avatar: null,
        }),
        category: expect.objectContaining({
          id: category.id.toString(),
          title: category.title,
        }),
        attachments: [],
      }),
    });
  });
});
