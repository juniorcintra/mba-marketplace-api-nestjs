import { Optional } from "@/core/types/optional";
import { User, UserProps } from "./user";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserAttachmentList } from "./user-attachment-list";

export interface ViewerProps extends UserProps {}

export class Viewer extends User<ViewerProps> {
  static create(props: Optional<ViewerProps, "avatar">, id?: UniqueEntityID) {
    const viewer = new Viewer(
      {
        ...props,
        avatar: props.avatar ?? new UserAttachmentList(),
      },
      id,
    );

    return viewer;
  }
}
