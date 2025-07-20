import {
  Count,
  ViewsPerDay,
  ViewsRepository,
} from "@/domain/marketplace/application/repositories/views-repository";
import { View } from "@/domain/marketplace/enterprise/entities/view";
import { Injectable } from "@nestjs/common";
import { PrismaViewMapper } from "../mappers/prisma-view-mapper";
import { PrismaService } from "../prisma.service";
import { Prisma } from "@prisma/client";
import { ViewDetails } from "@/domain/marketplace/enterprise/entities/value-objects/view-details";
import { PrismaViewDetailsMapper } from "../mappers/prisma-view-details-mapper";

@Injectable()
export class PrismaViewsRepository implements ViewsRepository {
  constructor(private prisma: PrismaService) {}

  async count({ sellerId, productId, from }: Count): Promise<number> {
    const where: Prisma.ViewWhereInput = {
      product: {
        ownerId: sellerId,
      },
    };

    if (productId) {
      where.productId = productId;
    }

    if (from) {
      where.createdAt = { gte: new Date(from.setHours(0, 0, 0, 0)) };
    }

    const amount = await this.prisma.view.count({
      where,
    });

    return amount;
  }

  async countPerDay({
    sellerId,
    productId,
    from = new Date(new Date().setDate(new Date().getDate() - 30)),
  }: Count): Promise<ViewsPerDay[]> {
    const normalizedFrom = new Date(from);
    normalizedFrom.setHours(0, 0, 0, 0);

    const where: Prisma.ViewWhereInput = {
      product: {
        ownerId: sellerId,
      },
      createdAt: { gte: normalizedFrom },
    };

    if (productId) {
      where.productId = productId;
    }
    const views = await this.prisma.view.findMany({
      where,
      orderBy: {
        createdAt: "asc",
      },
    });

    const groupedViews = views.reduce(
      (acc, view) => {
        const normalizedCreatedAt = new Date(view.createdAt);
        normalizedCreatedAt.setHours(0, 0, 0, 0);

        const dateKey = normalizedCreatedAt.toISOString().split("T")[0];

        acc[dateKey] = (acc[dateKey] || 0) + 1;

        return acc;
      },
      {} as Record<string, number>,
    );

    const allDays: string[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffInDays = Math.floor(
      (now.getTime() - normalizedFrom.getTime()) / (1000 * 3600 * 24),
    );

    for (let i = diffInDays; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      allDays.push(date.toISOString().split("T")[0]);
    }

    const viewsPerDay = allDays.map((day) => ({
      date: new Date(day),
      amount: groupedViews[day] || 0,
    }));

    return viewsPerDay;
  }

  async findById(id: string): Promise<View | null> {
    const view = await this.prisma.view.findUnique({
      where: {
        id,
      },
      include: {
        viewer: true,
        product: true,
      },
    });

    if (!view) {
      return null;
    }

    return PrismaViewMapper.toDomain(view);
  }

  async findDetailsById(id: string): Promise<ViewDetails | null> {
    const view = await this.prisma.view.findUnique({
      where: {
        id,
      },
      include: {
        product: {
          include: {
            owner: {
              include: {
                avatar: true,
              },
            },
            category: true,
            attachments: true,
          },
        },
        viewer: {
          include: {
            avatar: true,
          },
        },
      },
    });

    if (!view) {
      return null;
    }

    return PrismaViewDetailsMapper.toDomain(view);
  }

  async isViewed({ viewer, product }: View): Promise<boolean> {
    const view = await this.prisma.view.findUnique({
      where: {
        viewerId_productId: {
          viewerId: viewer.id.toString(),
          productId: product.id.toString(),
        },
      },
    });

    return !!view;
  }

  async create(view: View): Promise<ViewDetails> {
    const data = PrismaViewMapper.toPrisma(view);

    const viewDetails = await this.prisma.view.create({
      data,
      include: {
        product: {
          include: {
            owner: {
              include: {
                avatar: true,
              },
            },
            category: true,
            attachments: true,
          },
        },
        viewer: {
          include: {
            avatar: true,
          },
        },
      },
    });

    return PrismaViewDetailsMapper.toDomain(viewDetails);
  }
}
