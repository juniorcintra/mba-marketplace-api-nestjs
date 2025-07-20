import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ValueObject } from "@/core/entities/value-object";
import { Attachment } from "../attachment";
import { ProductStatus } from "../product";
import { Category } from "../category";
import { UserWithAvatar } from "./user-with-avatar";

export interface ProductDetailsProps {
  productId: UniqueEntityID;
  title: string;
  description: string;
  priceInCents: number;
  status: ProductStatus;
  owner: UserWithAvatar;
  category: Category;
  attachments: Attachment[];
  createdAt: Date;
  statusAt: Date;
}

export class ProductDetails extends ValueObject<ProductDetailsProps> {
  get productId() {
    return this.props.productId;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get priceInCents() {
    return this.props.priceInCents;
  }

  get status() {
    return this.props.status;
  }

  get owner() {
    return this.props.owner;
  }

  get category() {
    return this.props.category;
  }

  get attachments() {
    return this.props.attachments;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get statusAt() {
    return this.props.statusAt;
  }

  static create(props: ProductDetailsProps) {
    return new ProductDetails(props);
  }
}
