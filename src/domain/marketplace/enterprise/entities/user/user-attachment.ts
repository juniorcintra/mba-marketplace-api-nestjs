import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface UserAttachmentProps {
  userId: UniqueEntityID;
  attachmentId: UniqueEntityID;
}

export class UserAttachment extends Entity<UserAttachmentProps> {
  get userId() {
    return this.props.userId;
  }

  get attachmentId() {
    return this.props.attachmentId;
  }

  static create(props: UserAttachmentProps, id?: UniqueEntityID) {
    const userAttachment = new UserAttachment(props, id);

    return userAttachment;
  }
}
