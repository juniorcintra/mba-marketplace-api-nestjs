import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AttachmentFactory } from "test/factories/make-attachment";
import { CategoryFactory } from "test/factories/make-category";
import { ProductFactory } from "test/factories/make-product";
import { ProductAttachmentFactory } from "test/factories/make-product-attachment";
import { SellerFactory } from "test/factories/make-seller";

describe("Edit Product (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sellerFactory: SellerFactory;
  let categoryFactory: CategoryFactory;
  let productFactory: ProductFactory;
  let attachmentFactory: AttachmentFactory;
  let productAttachmentFactory: ProductAttachmentFactory;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        SellerFactory,
        CategoryFactory,
        ProductFactory,
        AttachmentFactory,
        ProductAttachmentFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    sellerFactory = moduleRef.get(SellerFactory);
    categoryFactory = moduleRef.get(CategoryFactory);
    productFactory = moduleRef.get(ProductFactory);
    attachmentFactory = moduleRef.get(AttachmentFactory);
    productAttachmentFactory = moduleRef.get(ProductAttachmentFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[PUT] /products/:id", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const category1 = await categoryFactory.makePrismaCategory();
    const category2 = await categoryFactory.makePrismaCategory();

    const attachment1 = await attachmentFactory.makePrismaAttachment();
    const attachment2 = await attachmentFactory.makePrismaAttachment();

    const product = await productFactory.makePrismaProduct({
      ownerId: user.id,
      categoryId: category1.id,
    });

    await productAttachmentFactory.makePrismaProductAttachment({
      attachmentId: attachment1.id,
      productId: product.id,
    });

    await productAttachmentFactory.makePrismaProductAttachment({
      attachmentId: attachment2.id,
      productId: product.id,
    });

    const attachment3 = await attachmentFactory.makePrismaAttachment();

    const productId = product.id.toString();
    const response = await request(app.getHttpServer())
      .put(`/products/${productId}`)
      .set("Cookie", [`accessToken=${accessToken}`])
      .send({
        title: "Product edited",
        description: "Product description edited",
        priceInCents: 1000,
        categoryId: category2.id.toString(),
        attachmentsIds: [attachment1.id.toString(), attachment3.id.toString()],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      product: expect.objectContaining({
        title: "Product edited",
        description: "Product description edited",
        priceInCents: 1000,
        owner: expect.objectContaining({
          id: user.id.toString(),
          email: user.email,
          avatar: null,
        }),
        category: expect.objectContaining({
          id: category2.id.toString(),
          title: category2.title,
        }),
        attachments: [
          expect.objectContaining({
            id: attachment1.id.toString(),
          }),
          expect.objectContaining({
            id: attachment3.id.toString(),
          }),
        ],
      }),
    });

    const productOnDatabase = await prisma.product.findFirst({
      where: {
        title: "Product edited",
      },
    });

    expect(productOnDatabase).toBeTruthy();

    const attachmentsOnDatabase = await prisma.attachment.findMany({
      where: {
        productId: productOnDatabase?.id,
      },
    });

    expect(attachmentsOnDatabase).toHaveLength(2);
    expect(attachmentsOnDatabase).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: attachment1.id.toString(),
        }),
        expect.objectContaining({
          id: attachment3.id.toString(),
        }),
      ]),
    );
  });
});
