import { ValueObject } from "@/core/entities/value-object";
import { UserWithAvatar } from "./user-with-avatar";
import { ProductDetails } from "./product-details";

export interface ViewDetailsProps {
  product: ProductDetails;
  viewer: UserWithAvatar;
}

export class ViewDetails extends ValueObject<ViewDetailsProps> {
  get product() {
    return this.props.product;
  }

  get viewer() {
    return this.props.viewer;
  }

  static create(props: ViewDetailsProps) {
    return new ViewDetails(props);
  }
}
