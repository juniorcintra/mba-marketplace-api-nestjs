import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { CategoryFactory } from "test/factories/make-category";
import { SellerFactory } from "test/factories/make-seller";

describe("Fetch categories (E2E)", () => {
  let app: INestApplication;
  let sellerFactory: SellerFactory;
  let categoryFactory: CategoryFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, CategoryFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    sellerFactory = moduleRef.get(SellerFactory);
    categoryFactory = moduleRef.get(CategoryFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[GET] /categories", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    await Promise.all([
      categoryFactory.makePrismaCategory({
        title: "Category 01",
      }),
      categoryFactory.makePrismaCategory({
        title: "Category 02",
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get("/categories")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      categories: expect.arrayContaining([
        expect.objectContaining({ slug: "category-01" }),
        expect.objectContaining({ slug: "category-02" }),
      ]),
    });
  });
});
