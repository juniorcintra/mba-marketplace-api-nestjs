import { ProductDetails } from "@/domain/marketplace/enterprise/entities/value-objects/product-details";
import { AttachmentPresenter } from "./attachment-presenter";
import { CategoryPresenter } from "./category-presenter";
import { UserWithAvatarPresenter } from "./user-with-avatar-presenter";

export class ProductDetailsPresenter {
  static toHTTP(productDetails: ProductDetails) {
    return {
      id: productDetails.productId.toString(),
      title: productDetails.title,
      description: productDetails.description,
      priceInCents: productDetails.priceInCents,
      status: productDetails.status,
      owner: UserWithAvatarPresenter.toHTTP(productDetails.owner),
      category: CategoryPresenter.toHTTP(productDetails.category),
      attachments: productDetails.attachments.map(AttachmentPresenter.toHTTP),
    };
  }
}
