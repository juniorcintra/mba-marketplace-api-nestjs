import { UniqueEntityID } from "@/core/entities/unique-entity-id";

import {
  UserAttachment,
  UserAttachmentProps,
} from "@/domain/marketplace/enterprise/entities/user/user-attachment";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

export function makeUserAttachment(
  override: Partial<UserAttachmentProps> = {},
  id?: UniqueEntityID,
) {
  const userAttachment = UserAttachment.create(
    {
      userId: new UniqueEntityID(),
      attachmentId: new UniqueEntityID(),
      ...override,
    },
    id,
  );

  return userAttachment;
}

@Injectable()
export class UserAttachmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaUserAttachment(
    data: Partial<UserAttachmentProps> = {},
  ): Promise<UserAttachment> {
    const userAttachment = makeUserAttachment(data);

    await this.prisma.attachment.update({
      where: {
        id: userAttachment.attachmentId.toString(),
      },
      data: {
        userId: userAttachment.userId.toString(),
      },
    });

    return userAttachment;
  }
}
