import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { View, ViewProps } from "@/domain/marketplace/enterprise/entities/view";
import { makeProduct } from "./make-product";
import { makeViewer } from "./make-viewer";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { PrismaViewMapper } from "@/infra/database/prisma/mappers/prisma-view-mapper";

export function makeView(
  override: Partial<ViewProps> = {},
  id?: UniqueEntityID,
) {
  const view = View.create(
    {
      product: makeProduct(),
      viewer: makeViewer(),
      ...override,
    },
    id,
  );

  return view;
}

@Injectable()
export class ViewFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaView(data: Partial<ViewProps> = {}): Promise<View> {
    const view = makeView(data);

    await this.prisma.view.create({
      data: PrismaViewMapper.toPrisma(view),
    });

    return view;
  }
}
