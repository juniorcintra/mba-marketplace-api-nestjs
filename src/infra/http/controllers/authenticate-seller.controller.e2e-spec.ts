import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { hash } from "bcryptjs";
import request from "supertest";
import { SellerFactory } from "test/factories/make-seller";

describe("Authenticate seller (E2E)", () => {
  let app: INestApplication;
  let sellerFactory: SellerFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    sellerFactory = moduleRef.get(SellerFactory);

    await app.init();
  });

  test("[POST] /sellers/sessions", async () => {
    await sellerFactory.makePrismaSeller({
      email: "johndoe@example.com",
      password: await hash("123456", 8),
    });

    const response = await request(app.getHttpServer())
      .post("/sellers/sessions")
      .send({
        email: "johndoe@example.com",
        password: "123456",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });
  });
});
