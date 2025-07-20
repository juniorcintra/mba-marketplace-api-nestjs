import { View } from "@/domain/marketplace/enterprise/entities/view";
import { ProductPresenter } from "./product-presenter";
import { UserPresenter } from "./user-presenter";

export class ViewPresenter {
  static toHTTP(view: View) {
    return {
      product: ProductPresenter.toHTTP(view.product),
      viewer: UserPresenter.toHTTP(view.viewer),
    };
  }
}
