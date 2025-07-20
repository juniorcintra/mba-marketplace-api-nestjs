import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AttachmentFactory } from "test/factories/make-attachment";
import { CategoryFactory } from "test/factories/make-category";
import { SellerFactory } from "test/factories/make-seller";

describe("Create Product (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sellerFactory: SellerFactory;
  let categoryFactory: CategoryFactory;
  let attachmentFactory: AttachmentFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory, CategoryFactory, AttachmentFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    sellerFactory = moduleRef.get(SellerFactory);
    categoryFactory = moduleRef.get(CategoryFactory);
    attachmentFactory = moduleRef.get(AttachmentFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[POST] /products", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const category = await categoryFactory.makePrismaCategory();

    const attachment1 = await attachmentFactory.makePrismaAttachment();
    const attachment2 = await attachmentFactory.makePrismaAttachment();

    const response = await request(app.getHttpServer())
      .post("/products")
      .set("Cookie", [`accessToken=${accessToken}`])
      .send({
        title: "Product 01",
        description: "Product 01 description",
        priceInCents: 1000,
        categoryId: category.id.toString(),
        attachmentsIds: [attachment1.id.toString(), attachment2.id.toString()],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      product: expect.objectContaining({
        title: "Product 01",
        description: "Product 01 description",
        priceInCents: 1000,
        status: "available",
        owner: expect.objectContaining({
          id: user.id.toString(),
          email: user.email,
          avatar: null,
        }),
        category: expect.objectContaining({
          id: category.id.toString(),
          title: category.title,
        }),
        attachments: [
          expect.objectContaining({
            id: attachment1.id.toString(),
          }),
          expect.objectContaining({
            id: attachment2.id.toString(),
          }),
        ],
      }),
    });

    const productOnDatabase = await prisma.product.findFirst({
      where: {
        title: "Product 01",
      },
    });

    expect(productOnDatabase).toBeTruthy();

    const attachmentsOnDatabase = await prisma.attachment.findMany({
      where: {
        productId: productOnDatabase?.id,
      },
    });

    expect(attachmentsOnDatabase).toHaveLength(2);
  });
});
