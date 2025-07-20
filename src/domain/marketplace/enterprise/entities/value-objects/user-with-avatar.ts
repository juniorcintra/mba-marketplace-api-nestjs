import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { ValueObject } from "@/core/entities/value-object";
import { Attachment } from "../attachment";

export interface UserWithAvatarProps {
  userId: UniqueEntityID;
  name: string;
  phone: string;
  email: string;
  password: string;
  avatar?: Attachment | null;
}

export class UserWithAvatar extends ValueObject<UserWithAvatarProps> {
  get userId() {
    return this.props.userId;
  }

  get name() {
    return this.props.name;
  }

  get phone() {
    return this.props.phone;
  }

  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  get avatar() {
    return this.props.avatar;
  }

  static create(props: UserWithAvatarProps) {
    return new UserWithAvatar(props);
  }
}
