import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { SellerFactory } from "test/factories/make-seller";

describe("Create Category (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sellerFactory: SellerFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    sellerFactory = moduleRef.get(SellerFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[POST] /categories", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const response = await request(app.getHttpServer())
      .post("/categories")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send({
        title: "Category 01",
      });

    expect(response.statusCode).toBe(201);

    const categoryOnDatabase = await prisma.category.findUnique({
      where: {
        slug: "category-01",
      },
    });

    expect(categoryOnDatabase).toBeTruthy();
  });
});
