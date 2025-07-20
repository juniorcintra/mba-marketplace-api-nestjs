import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { SellerFactory } from "test/factories/make-seller";
import { CategoryFactory } from "test/factories/make-category";
import { ProductFactory } from "test/factories/make-product";
import { AttachmentFactory } from "test/factories/make-attachment";
import { ProductAttachmentFactory } from "test/factories/make-product-attachment";
import { UserAttachmentFactory } from "test/factories/make-user-attachment";

describe("Get Product by id (E2E)", () => {
  let app: INestApplication;
  let sellerFactory: SellerFactory;
  let categoryFactory: CategoryFactory;
  let attachmentFactory: AttachmentFactory;
  let productAttachmentFactory: ProductAttachmentFactory;
  let userAttachmentFactory: UserAttachmentFactory;
  let productFactory: ProductFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        SellerFactory,
        CategoryFactory,
        AttachmentFactory,
        ProductAttachmentFactory,
        UserAttachmentFactory,
        ProductFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    sellerFactory = moduleRef.get(SellerFactory);
    categoryFactory = moduleRef.get(CategoryFactory);
    attachmentFactory = moduleRef.get(AttachmentFactory);
    productAttachmentFactory = moduleRef.get(ProductAttachmentFactory);
    userAttachmentFactory = moduleRef.get(UserAttachmentFactory);
    productFactory = moduleRef.get(ProductFactory);

    await app.init();
  });

  test("[GET] /products/:id", async () => {
    const attachment1 = await attachmentFactory.makePrismaAttachment();
    const attachment2 = await attachmentFactory.makePrismaAttachment();
    const attachment3 = await attachmentFactory.makePrismaAttachment();

    const category = await categoryFactory.makePrismaCategory();

    const seller = await sellerFactory.makePrismaSeller();

    await userAttachmentFactory.makePrismaUserAttachment({
      attachmentId: attachment1.id,
      userId: seller.id,
    });

    const product = await productFactory.makePrismaProduct({
      ownerId: seller.id,
      categoryId: category.id,
    });

    await productAttachmentFactory.makePrismaProductAttachment({
      attachmentId: attachment2.id,
      productId: product.id,
    });

    await productAttachmentFactory.makePrismaProductAttachment({
      attachmentId: attachment3.id,
      productId: product.id,
    });

    const response = await request(app.getHttpServer())
      .get(`/products/${product.id}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      product: expect.objectContaining({
        id: product.id.toString(),
        title: product.title,
        description: product.description,
        priceInCents: product.priceInCents,
        status: product.status,
        owner: expect.objectContaining({
          id: seller.id.toString(),
          email: seller.email,
          avatar: expect.objectContaining({
            id: attachment1.id.toString(),
          }),
        }),
        category: expect.objectContaining({
          id: category.id.toString(),
          title: category.title,
        }),
        attachments: [
          expect.objectContaining({
            id: attachment2.id.toString(),
          }),
          expect.objectContaining({
            id: attachment3.id.toString(),
          }),
        ],
      }),
    });
  });
});
