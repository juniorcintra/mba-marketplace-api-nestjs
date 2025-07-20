import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AttachmentFactory } from "test/factories/make-attachment";
import { SellerFactory } from "test/factories/make-seller";
import { UserAttachmentFactory } from "test/factories/make-user-attachment";

describe("Get Seller profile (E2E)", () => {
  let app: INestApplication;
  let sellerFactory: SellerFactory;
  let attachmentFactory: AttachmentFactory;
  let userAttachmentFactory: UserAttachmentFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, AttachmentFactory, UserAttachmentFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    sellerFactory = moduleRef.get(SellerFactory);
    attachmentFactory = moduleRef.get(AttachmentFactory);
    userAttachmentFactory = moduleRef.get(UserAttachmentFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[GET] /sellers/me", async () => {
    const user = await sellerFactory.makePrismaSeller({
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
    });

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const attachment = await attachmentFactory.makePrismaAttachment();

    await userAttachmentFactory.makePrismaUserAttachment({
      attachmentId: attachment.id,
      userId: user.id,
    });

    const response = await request(app.getHttpServer())
      .get("/sellers/me")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      seller: expect.objectContaining({
        name: "John Doe",
        phone: "123456789",
        email: "johndoe@example.com",
        avatar: expect.objectContaining({
          id: attachment.id.toString(),
        }),
      }),
    });
  });
});
