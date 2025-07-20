import { WatchedList } from "@/core/entities/watched-list";
import { UserAttachment } from "./user-attachment";

export class UserAttachmentList extends WatchedList<UserAttachment> {
  compareItems(a: UserAttachment, b: UserAttachment): boolean {
    return a.attachmentId === b.attachmentId;
  }
}
