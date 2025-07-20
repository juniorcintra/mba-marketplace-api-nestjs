import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { EnvService } from "@/infra/env/env.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { join } from "node:path";
import request from "supertest";
import { SellerFactory } from "test/factories/make-seller";
import { promises as fs } from "node:fs";

describe("Get attachment content (E2E)", () => {
  let app: INestApplication;
  let sellerFactory: SellerFactory;
  let jwt: JwtService;
  let envService: EnvService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SellerFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    sellerFactory = moduleRef.get(SellerFactory);
    jwt = moduleRef.get(JwtService);
    envService = moduleRef.get(EnvService);

    await app.init();
  });

  test("[GET] /attachments/:path", async () => {
    const user = await sellerFactory.makePrismaSeller();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const uniqueFileName = `123-sample-attachment.png`;
    const filePath = join(envService.get("UPLOAD_PATH"), uniqueFileName);

    await fs.writeFile(filePath, Buffer.from(""));

    const response = await request(app.getHttpServer())
      .get("/attachments/123-sample-attachment.png")
      .set("Cookie", [`accessToken=${accessToken}`]);

    expect(response.statusCode).toBe(200);
  });
});
