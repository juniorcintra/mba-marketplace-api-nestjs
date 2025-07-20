import { Optional } from "@/core/types/optional";
import { User, UserProps } from "./user";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserAttachmentList } from "./user-attachment-list";

export interface SellerProps extends UserProps {}

export class Seller extends User<SellerProps> {
  static create(props: Optional<SellerProps, "avatar">, id?: UniqueEntityID) {
    const seller = new Seller(
      {
        ...props,
        avatar: props.avatar ?? new UserAttachmentList(),
      },
      id,
    );

    return seller;
  }
}
