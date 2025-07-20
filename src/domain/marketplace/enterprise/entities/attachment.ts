import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface AttachmentProps {
  path: string;
}

export class Attachment extends Entity<AttachmentProps> {
  get path() {
    return this.props.path;
  }

  static create(props: AttachmentProps, id?: UniqueEntityID) {
    const attachment = new Attachment(props, id);

    return attachment;
  }
}
