import { UserAttachment } from "../../enterprise/entities/user/user-attachment";

export abstract class UserAttachmentsRepository {
  abstract findByUserId(userId: string): Promise<UserAttachment | null>;
  abstract create(attachment: UserAttachment): Promise<void>;
  abstract delete(attachment: UserAttachment): Promise<void>;
}
