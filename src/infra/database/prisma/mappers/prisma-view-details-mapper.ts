import { View as PrismaView } from "@prisma/client";
import { ViewDetails } from "@/domain/marketplace/enterprise/entities/value-objects/view-details";
import {
  PrismaUserWithAvatar,
  PrismaUserWithAvatarMapper,
} from "./prisma-user-with-avatar-mapper";
import {
  PrismaProductDetails,
  PrismaProductDetailsMapper,
} from "./prisma-product-details-mapper";

type PrismaViewDetails = PrismaView & {
  product: PrismaProductDetails;
  viewer: PrismaUserWithAvatar;
};

export class PrismaViewDetailsMapper {
  static toDomain(raw: PrismaViewDetails): ViewDetails {
    return ViewDetails.create({
      product: PrismaProductDetailsMapper.toDomain(raw.product),
      viewer: PrismaUserWithAvatarMapper.toDomain(raw.viewer),
    });
  }
}
