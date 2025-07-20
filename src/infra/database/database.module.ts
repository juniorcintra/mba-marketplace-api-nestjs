import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaAttachmentsRepository } from "./prisma/repositories/prisma-attachments-repository";
import { PrismaCategoriesRepository } from "./prisma/repositories/prisma-categories-repository";
import { PrismaProductAttachmentsRepository } from "./prisma/repositories/prisma-product-attachments-repository";
import { PrismaProductsRepository } from "./prisma/repositories/prisma-products-repository";
import { PrismaSellersRepository } from "./prisma/repositories/prisma-sellers-repository";
import { PrismaViewersRepository } from "./prisma/repositories/prisma-viewers-repository";
import { PrismaViewsRepository } from "./prisma/repositories/prisma-views-repository";
import { CategoriesRepository } from "@/domain/marketplace/application/repositories/categories-repository";
import { SellersRepository } from "@/domain/marketplace/application/repositories/sellers-repository";
import { AttachmentsRepository } from "@/domain/marketplace/application/repositories/attachments-repository";
import { PrismaUserAttachmentsRepository } from "./prisma/repositories/prisma-user-attachments-repository";
import { UserAttachmentsRepository } from "@/domain/marketplace/application/repositories/user-attachments-repository";
import { ProductsRepository } from "@/domain/marketplace/application/repositories/products-repository";
import { ProductAttachmentsRepository } from "@/domain/marketplace/application/repositories/product-attachments-repository";
import { ViewersRepository } from "@/domain/marketplace/application/repositories/viewers-repository";
import { ViewsRepository } from "@/domain/marketplace/application/repositories/views-repository";

@Module({
  providers: [
    PrismaService,
    {
      provide: AttachmentsRepository,
      useClass: PrismaAttachmentsRepository,
    },
    {
      provide: UserAttachmentsRepository,
      useClass: PrismaUserAttachmentsRepository,
    },
    {
      provide: CategoriesRepository,
      useClass: PrismaCategoriesRepository,
    },
    {
      provide: ProductAttachmentsRepository,
      useClass: PrismaProductAttachmentsRepository,
    },
    {
      provide: ProductsRepository,
      useClass: PrismaProductsRepository,
    },

    {
      provide: SellersRepository,
      useClass: PrismaSellersRepository,
    },
    {
      provide: ViewersRepository,
      useClass: PrismaViewersRepository,
    },
    {
      provide: ViewsRepository,
      useClass: PrismaViewsRepository,
    },
  ],
  exports: [
    PrismaService,
    AttachmentsRepository,
    UserAttachmentsRepository,
    CategoriesRepository,
    ProductAttachmentsRepository,
    ProductsRepository,
    SellersRepository,
    ViewersRepository,
    ViewsRepository,
  ],
})
export class DatabaseModule {}
