import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { CategoryFactory } from "test/factories/make-category";
import { ProductFactory } from "test/factories/make-product";
import { SellerFactory } from "test/factories/make-seller";
import { ViewFactory } from "test/factories/make-view";
import { ViewerFactory } from "test/factories/make-viewer";

describe("Count the views received by the seller in the last 30 days (E2E)", () => {
  let app: INestApplication;
  let sellerFactory: SellerFactory;
  let categoryFactory: CategoryFactory;
  let productFactory: ProductFactory;
  let viewerFactory: ViewerFactory;
  let viewFactory: ViewFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        SellerFactory,
        CategoryFactory,
        ProductFactory,
        ViewerFactory,
        ViewFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    sellerFactory = moduleRef.get(SellerFactory);
    categoryFactory = moduleRef.get(CategoryFactory);
    productFactory = moduleRef.get(ProductFactory);
    viewerFactory = moduleRef.get(ViewerFactory);
    viewFactory = moduleRef.get(ViewFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[GET] /sellers/metrics/views", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const category = await categoryFactory.makePrismaCategory();

    const product = await productFactory.makePrismaProduct({
      ownerId: user.id,
      categoryId: category.id,
    });

    for (let i = 1; i <= 50; i++) {
      const viewer = await viewerFactory.makePrismaViewer();

      const fakerCreatedAt = new Date();
      fakerCreatedAt.setDate(fakerCreatedAt.getDate() - i * 2);

      await viewFactory.makePrismaView({
        product,
        viewer,
        createdAt: fakerCreatedAt,
      });
    }

    const response = await request(app.getHttpServer())
      .get("/sellers/metrics/views")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ amount: 15 });
  });
});
