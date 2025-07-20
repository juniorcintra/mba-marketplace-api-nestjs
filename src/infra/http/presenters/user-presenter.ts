import {
  User,
  UserProps,
} from "@/domain/marketplace/enterprise/entities/user/user";

export class UserPresenter {
  static toHTTP(user: User<UserProps>) {
    return {
      id: user.id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
    };
  }
}
