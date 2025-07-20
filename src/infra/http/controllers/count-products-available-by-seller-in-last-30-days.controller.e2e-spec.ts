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

describe("Count the number of products available by the seller in the last 30 days (E2E)", () => {
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

  test("[GET] /sellers/metrics/products/available", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const category = await categoryFactory.makePrismaCategory();

    for (let i = 1; i <= 50; i++) {
      const fakerStatusAt = new Date();
      fakerStatusAt.setDate(fakerStatusAt.getDate() - i);

      await productFactory.makePrismaProduct({
        ownerId: user.id,
        title: `Produto 0${i}`,
        status: i % 2 === 0 ? ProductStatus.AVAILABLE : ProductStatus.SOLD,
        categoryId: category.id,
        statusAt: fakerStatusAt,
      });
    }

    const response = await request(app.getHttpServer())
      .get("/sellers/metrics/products/available")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ amount: 15 });
  });
});
