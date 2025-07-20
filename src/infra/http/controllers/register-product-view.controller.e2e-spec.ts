import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { CategoryFactory } from 'test/factories/make-category'
import { ProductFactory } from 'test/factories/make-product'
import { SellerFactory } from 'test/factories/make-seller'
import { ViewerFactory } from 'test/factories/make-viewer'

describe('Register Product View (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let sellerFactory: SellerFactory
  let categoryFactory: CategoryFactory
  let productFactory: ProductFactory
  let viewerFactory: ViewerFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        SellerFactory,
        CategoryFactory,
        ProductFactory,
        ViewerFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    sellerFactory = moduleRef.get(SellerFactory)
    categoryFactory = moduleRef.get(CategoryFactory)
    productFactory = moduleRef.get(ProductFactory)
    viewerFactory = moduleRef.get(ViewerFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /products/{id}/views', async () => {
    const viewer = await viewerFactory.makePrismaViewer()
    const accessToken = jwt.sign({ sub: viewer.id.toString() })

    const seller = await sellerFactory.makePrismaSeller()
    const category = await categoryFactory.makePrismaCategory()

    const product = await productFactory.makePrismaProduct({
      ownerId: seller.id,
      categoryId: category.id,
    })

    const productId = product.id
    const response = await request(app.getHttpServer())
      .post(`/products/${productId}/views`)
      .set('Cookie', [`accessToken=${accessToken}`])
      .send()

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      product: expect.objectContaining({
        title: product.title,
        description: product.description,
        priceInCents: product.priceInCents,
        status: product.status,
        owner: expect.objectContaining({
          id: seller.id.toString(),
          email: seller.email,
          avatar: null,
        }),
        category: expect.objectContaining({
          id: category.id.toString(),
          title: category.title,
        }),
        attachments: [],
      }),
      viewer: expect.objectContaining({
        id: viewer.id.toString(),
        email: viewer.email,
        avatar: null,
      }),
    })

    const viewOnDatabase = await prisma.view.findUnique({
      where: {
        viewerId_productId: {
          viewerId: viewer.id.toString(),
          productId: productId.toString(),
        },
      },
    })

    expect(viewOnDatabase).toBeTruthy()
  })
})
