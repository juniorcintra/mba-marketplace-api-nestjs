import {
  View as PrismaView,
  User as PrismaViewer,
  Product as PrismaProduct,
  Prisma,
} from "@prisma/client";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { View } from "@/domain/marketplace/enterprise/entities/view";
import { PrismaViewerMapper } from "./prisma-viewer-mapper";
import { PrismaProductMapper } from "./prisma-product-mapper";

type PrismaViewWithDetails = PrismaView & {
  viewer: PrismaViewer;
  product: PrismaProduct;
};

export class PrismaViewMapper {
  static toDomain(raw: PrismaViewWithDetails): View {
    return View.create(
      {
        viewer: PrismaViewerMapper.toDomain(raw.viewer),
        product: PrismaProductMapper.toDomain(raw.product),
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id.toString()),
    );
  }

  static toPrisma(view: View): Prisma.ViewUncheckedCreateInput {
    return {
      id: view.id.toString(),
      viewerId: view.viewer.id.toString(),
      productId: view.product.id.toString(),
      createdAt: view.createdAt,
    };
  }
}
