import { Attachment } from "../../enterprise/entities/attachment";

export interface FindMany<T> {
  data: T[];
  hasAll: boolean;
  inexistentIds: string[];
}
export type AsyncFindMany<T> = Promise<FindMany<T>>;

export abstract class AttachmentsRepository {
  abstract findById(id: string): Promise<Attachment | null>;
  abstract findManyByIds(ids: string[]): AsyncFindMany<Attachment>;
  abstract create(attachment: Attachment): Promise<void>;
  abstract createMany(attachments: Attachment[]): Promise<void>;
}
