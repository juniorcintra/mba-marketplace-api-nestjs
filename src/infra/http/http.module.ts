import { Module } from "@nestjs/common";

import { AuthenticateSellerController } from "./controllers/authenticate-seller.controller";
import { RegisterSellerController } from "./controllers/register-seller.controller";
import { CreateCategoryController } from "./controllers/create-category.controller";
import { CreateProductController } from "./controllers/create-product.controller";
import { FetchAllCategoriesController } from "./controllers/fetch-all-categories.controller";
import { FetchAllProductsController } from "./controllers/fetch-all-products.controller";
import { CreateCategoryUseCase } from "@/domain/marketplace/application/use-cases/create-category";
import { DatabaseModule } from "../database/database.module";
import { FetchAllCategoriesUseCase } from "@/domain/marketplace/application/use-cases/fetch-all-categories";
import { CryptographyModule } from "../cryptography/cryptography.module";
import { RegisterSellerUseCase } from "@/domain/marketplace/application/use-cases/register-seller";
import { AuthenticateSellerUseCase } from "@/domain/marketplace/application/use-cases/authenticate-seller";
import { GetSellerProfileController } from "./controllers/get-seller-profile.controller";
import { GetSellerProfileUseCase } from "@/domain/marketplace/application/use-cases/get-seller-profile";
import { EditSellerController } from "./controllers/edit-seller.controller";
import { EditSellerUseCase } from "@/domain/marketplace/application/use-cases/edit-seller";
import { CreateProductUseCase } from "@/domain/marketplace/application/use-cases/create-product";
import { EditProductUseCase } from "@/domain/marketplace/application/use-cases/edit-product";
import { EditProductController } from "./controllers/edit-product.controller";
import { GetProductByIdUseCase } from "@/domain/marketplace/application/use-cases/get-product-by-id";
import { GetProductByIdController } from "./controllers/get-product-by-id.controller";
import { ChangeProductStatusUseCase } from "@/domain/marketplace/application/use-cases/change-product-status";
import { ChangeProductStatusController } from "./controllers/change-product-status.controller";
import { FetchProductsByOwnerIdUseCase } from "@/domain/marketplace/application/use-cases/fetch-products-by-owner";
import { FetchProductsByOwnerController } from "./controllers/fetch-products-by-owner.controller";
import { FetchAllProductsUseCase } from "@/domain/marketplace/application/use-cases/fetch-all-products";
import { RegisterProductViewUseCase } from "@/domain/marketplace/application/use-cases/register-product-view";
import { RegisterProductViewController } from "./controllers/register-product-view.controller";
import { CountSellerProductsUseCase } from "@/domain/marketplace/application/use-cases/count-seller-products";
import { CountProductsSoldBySellerInLast30DaysController } from "./controllers/count-products-sold-by-seller-in-last-30-days.controller";
import { CountProductsAvailableBySellerInLast30DaysController } from "./controllers/count-products-available-by-seller-in-last-30-days.controller";
import { CountSellerViewsInLast30DaysController } from "./controllers/count-seller-views-in-last-30-days.controller";
import { CountSellerViewsUseCase } from "@/domain/marketplace/application/use-cases/count-seller-views";
import { CountSellerViewsPerDayUseCase } from "@/domain/marketplace/application/use-cases/count-seller-views-per-day";
import { CountSellerViewsPerDayInLast30DaysController } from "./controllers/count-seller-views-per-day-in-last-30-days.controller";
import { CountProductViewsUseCase } from "@/domain/marketplace/application/use-cases/count-product-views";
import { CountProductViewsInLast7DaysController } from "./controllers/count-product-views-in-last-7-days.controller";
import { UploadAttachmenstController } from "./controllers/upload-attachments.controller";
import { StorageModule } from "../storage/storage.module";
import { UploadAndCreateAttachmentUseCase } from "@/domain/marketplace/application/use-cases/upload-and-create-attachment";
import { GetAttachmentContentController } from "./controllers/get-attachment-content.controller";
import { GetAttachmentContentUseCase } from "@/domain/marketplace/application/use-cases/get-attachment-content";
import { SignOutController } from "./controllers/sign-out.controller";

@Module({
  imports: [DatabaseModule, CryptographyModule, StorageModule],
  controllers: [
    RegisterSellerController,
    EditSellerController,
    GetSellerProfileController,
    CountProductsSoldBySellerInLast30DaysController,
    CountProductsAvailableBySellerInLast30DaysController,
    CountSellerViewsInLast30DaysController,
    CountSellerViewsPerDayInLast30DaysController,
    CountProductViewsInLast7DaysController,
    AuthenticateSellerController,
    CreateCategoryController,
    CreateProductController,
    FetchProductsByOwnerController,
    GetProductByIdController,
    EditProductController,
    ChangeProductStatusController,
    FetchAllCategoriesController,
    FetchAllProductsController,
    RegisterProductViewController,
    UploadAttachmenstController,
    GetAttachmentContentController,
    SignOutController,
  ],
  providers: [
    RegisterSellerUseCase,
    EditSellerUseCase,
    GetSellerProfileUseCase,
    CountSellerProductsUseCase,
    CountSellerViewsUseCase,
    CountSellerViewsPerDayUseCase,
    CountProductViewsUseCase,
    CreateCategoryUseCase,
    CreateProductUseCase,
    FetchAllProductsUseCase,
    FetchProductsByOwnerIdUseCase,
    GetProductByIdUseCase,
    EditProductUseCase,
    ChangeProductStatusUseCase,
    FetchAllCategoriesUseCase,
    AuthenticateSellerUseCase,
    RegisterProductViewUseCase,
    UploadAndCreateAttachmentUseCase,
    GetAttachmentContentUseCase,
  ],
})
export class httpModule {}
