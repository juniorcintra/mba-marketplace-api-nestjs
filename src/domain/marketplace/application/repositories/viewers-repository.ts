import { Viewer } from "../../enterprise/entities/user/viewer";
import { UserWithAvatar } from "../../enterprise/entities/value-objects/user-with-avatar";

export abstract class ViewersRepository {
  abstract findById(id: string): Promise<Viewer | null>;
  abstract findWithAvatarById(id: string): Promise<UserWithAvatar | null>;
  abstract create(viewer: Viewer): Promise<void>;
}
