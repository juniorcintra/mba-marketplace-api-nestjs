import { UserWithAvatar } from "@/domain/marketplace/enterprise/entities/value-objects/user-with-avatar";
import { AttachmentPresenter } from "./attachment-presenter";

export class UserWithAvatarPresenter {
  static toHTTP(userWithAvatar: UserWithAvatar) {
    return {
      id: userWithAvatar.userId.toString(),
      name: userWithAvatar.name,
      phone: userWithAvatar.phone,
      email: userWithAvatar.email,
      avatar: userWithAvatar.avatar
        ? AttachmentPresenter.toHTTP(userWithAvatar.avatar)
        : null,
    };
  }
}
