import { ViewersRepository } from "@/domain/marketplace/application/repositories/viewers-repository";
import { Viewer } from "@/domain/marketplace/enterprise/entities/user/viewer";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaViewerMapper } from "../mappers/prisma-viewer-mapper";
import { UserWithAvatar } from "@/domain/marketplace/enterprise/entities/value-objects/user-with-avatar";
import { PrismaUserWithAvatarMapper } from "../mappers/prisma-user-with-avatar-mapper";

@Injectable()
export class PrismaViewersRepository implements ViewersRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Viewer | null> {
    const viewer = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!viewer) {
      return null;
    }

    return PrismaViewerMapper.toDomain(viewer);
  }

  async findWithAvatarById(id: string): Promise<UserWithAvatar | null> {
    const viewerWithAvatar = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        avatar: true,
      },
    });

    if (!viewerWithAvatar) {
      return null;
    }

    return PrismaUserWithAvatarMapper.toDomain(viewerWithAvatar);
  }

  async create(viewer: Viewer): Promise<void> {
    const data = PrismaViewerMapper.toPrisma(viewer);

    await this.prisma.user.create({
      data,
    });
  }
}
