import {
  User as PrismaUser,
  Attachment as PrismaAttachment,
} from "@prisma/client";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserWithAvatar } from "@/domain/marketplace/enterprise/entities/value-objects/user-with-avatar";
import { PrismaAttachmentMapper } from "./prisma-attachment-mapper";

export type PrismaUserWithAvatar = PrismaUser & {
  avatar: PrismaAttachment | null;
};

export class PrismaUserWithAvatarMapper {
  static toDomain(raw: PrismaUserWithAvatar): UserWithAvatar {
    return UserWithAvatar.create({
      userId: new UniqueEntityID(raw.id),
      name: raw.name,
      phone: raw.phone,
      email: raw.email,
      password: raw.password,
      avatar: raw.avatar ? PrismaAttachmentMapper.toDomain(raw.avatar) : null,
    });
  }
}
