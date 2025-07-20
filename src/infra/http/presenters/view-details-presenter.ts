import { ViewDetails } from "@/domain/marketplace/enterprise/entities/value-objects/view-details";
import { ProductDetailsPresenter } from "./product-details-presenter";
import { UserWithAvatarPresenter } from "./user-with-avatar-presenter";

export class ViewDetailsPresenter {
  static toHTTP(viewDetails: ViewDetails) {
    return {
      product: ProductDetailsPresenter.toHTTP(viewDetails.product),
      viewer: UserWithAvatarPresenter.toHTTP(viewDetails.viewer),
    };
  }
}
