import { Entity } from "@/core/entities/entity";
import { UserAttachmentList } from "./user-attachment-list";

export interface UserProps {
  name: string;
  phone: string;
  email: string;
  password: string;
  avatar: UserAttachmentList;
}

export abstract class User<Props extends UserProps> extends Entity<Props> {
  get name() {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
  }

  get phone() {
    return this.props.phone;
  }

  set phone(phone: string) {
    this.props.phone = phone;
  }

  get email() {
    return this.props.email;
  }

  set email(email: string) {
    this.props.email = email;
  }

  get password() {
    return this.props.password;
  }

  set password(password: string) {
    this.props.password = password;
  }

  get avatar() {
    return this.props.avatar;
  }

  set avatar(avatar: UserAttachmentList) {
    this.props.avatar = avatar;
  }
}
