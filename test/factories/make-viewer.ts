import { faker } from "@faker-js/faker";

import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
  Viewer,
  ViewerProps,
} from "@/domain/marketplace/enterprise/entities/user/viewer";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { PrismaViewerMapper } from "@/infra/database/prisma/mappers/prisma-viewer-mapper";

export function makeViewer(
  override: Partial<ViewerProps> = {},
  id?: UniqueEntityID,
) {
  const viewer = Viewer.create(
    {
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      ...override,
    },
    id,
  );

  return viewer;
}

@Injectable()
export class ViewerFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaViewer(data: Partial<ViewerProps> = {}): Promise<Viewer> {
    const viewer = makeViewer(data);

    await this.prisma.user.create({
      data: PrismaViewerMapper.toPrisma(viewer),
    });

    return viewer;
  }
}
