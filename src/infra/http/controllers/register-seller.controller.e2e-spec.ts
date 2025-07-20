import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AttachmentFactory } from "test/factories/make-attachment";

describe("Register seller (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let attachmentFactory: AttachmentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AttachmentFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);
    attachmentFactory = moduleRef.get(AttachmentFactory);

    await app.init();
  });

  test("[POST] /sellers", async () => {
    const attachment = await attachmentFactory.makePrismaAttachment();

    const response = await request(app.getHttpServer()).post("/sellers").send({
      name: "John Doe",
      phone: "123456789",
      email: "johndoe@example.com",
      avatarId: attachment.id.toString(),
      password: "123456",
      passwordConfirmation: "123456",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      seller: expect.objectContaining({
        name: "John Doe",
        avatar: expect.objectContaining({
          id: attachment.id.toString(),
        }),
      }),
    });

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        email: "johndoe@example.com",
      },
    });

    expect(userOnDatabase).toBeTruthy();

    const attachmentOnDatabase = await prisma.attachment.findUnique({
      where: {
        userId: userOnDatabase?.id,
      },
    });

    expect(attachmentOnDatabase).not.toBeNull();
  });
});
