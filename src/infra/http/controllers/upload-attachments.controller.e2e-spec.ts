import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { SellerFactory } from "test/factories/make-seller";

describe("Upload attachment (E2E)", () => {
  let app: INestApplication;
  let sellerFactory: SellerFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    sellerFactory = moduleRef.get(SellerFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[POST] /attachments", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const response = await request(app.getHttpServer())
      .post("/attachments")
      .set("Cookie", [`accessToken=${accessToken}`])
      .attach("files", "./test/e2e/sample-attachment.png")
      .attach("files", "./test/e2e/sample-attachment.png")
      .attach("files", "./test/e2e/sample-attachment.png");

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      attachments: [
        expect.objectContaining({
          id: expect.any(String),
          url: expect.any(String),
        }),
        expect.objectContaining({
          id: expect.any(String),
          url: expect.any(String),
        }),
        expect.objectContaining({
          id: expect.any(String),
          url: expect.any(String),
        }),
      ],
    });
  });
});
