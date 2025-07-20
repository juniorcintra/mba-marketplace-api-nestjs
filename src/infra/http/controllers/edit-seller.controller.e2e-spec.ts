import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AttachmentFactory } from "test/factories/make-attachment";
import { SellerFactory } from "test/factories/make-seller";
import { UserAttachmentFactory } from "test/factories/make-user-attachment";

describe("Edit Seller (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
    prisma = moduleRef.get(PrismaService);
    sellerFactory = moduleRef.get(SellerFactory);
    attachmentFactory = moduleRef.get(AttachmentFactory);
    userAttachmentFactory = moduleRef.get(UserAttachmentFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[PUT] /sellers", async () => {
    const attachment1 = await attachmentFactory.makePrismaAttachment();

    const seller = await sellerFactory.makePrismaSeller({
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
    });
    const accessToken = jwt.sign({ sub: seller.id.toString() });

    await userAttachmentFactory.makePrismaUserAttachment({
      attachmentId: attachment1.id,
      userId: seller.id,
    });

    const attachment2 = await attachmentFactory.makePrismaAttachment();

    const response = await request(app.getHttpServer())
      .put("/sellers")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send({
        name: "John Doe edited",
        phone: "123123123",
        email: "edited@example.com",
        avatarId: attachment2.id.toString(),
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      seller: expect.objectContaining({
        id: seller.id.toString(),
        name: "John Doe edited",
        phone: "123123123",
        email: "edited@example.com",
        avatar: expect.objectContaining({
          id: attachment2.id.toString(),
        }),
      }),
    });

    const userOnDatabase = await prisma.user.findFirst({
      where: {
        email: "edited@example.com",
      },
    });

    expect(userOnDatabase).toBeTruthy();

    const attachmentsOnDatabase = await prisma.attachment.findMany({
      where: {
        userId: userOnDatabase?.id,
      },
    });

    expect(attachmentsOnDatabase).toHaveLength(1);
    expect(attachmentsOnDatabase).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: attachment2.id.toString(),
        }),
      ]),
    );
  });
});
