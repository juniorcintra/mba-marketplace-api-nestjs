import { User as PrismaUser, Prisma } from "@prisma/client";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Viewer } from "@/domain/marketplace/enterprise/entities/user/viewer";

export class PrismaViewerMapper {
  static toDomain(raw: PrismaUser): Viewer {
    return Viewer.create(
      {
        name: raw.name,
        phone: raw.phone,
        email: raw.email,
        password: raw.password,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(viewer: Viewer): Prisma.UserUncheckedCreateInput {
    return {
      id: viewer.id.toString(),
      name: viewer.name,
      phone: viewer.phone,
      email: viewer.email,
      password: viewer.password,
    };
  }
}
