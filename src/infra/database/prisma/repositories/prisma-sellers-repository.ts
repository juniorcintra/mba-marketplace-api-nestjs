import { SellersRepository } from "@/domain/marketplace/application/repositories/sellers-repository";
import { Seller } from "@/domain/marketplace/enterprise/entities/user/seller";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaSellerMapper } from "../mappers/prisma-seller-mapper";
import { UserAttachmentsRepository } from "@/domain/marketplace/application/repositories/user-attachments-repository";
import { UserWithAvatar } from "@/domain/marketplace/enterprise/entities/value-objects/user-with-avatar";
import { PrismaUserWithAvatarMapper } from "../mappers/prisma-user-with-avatar-mapper";
import { AttachmentsRepository } from "@/domain/marketplace/application/repositories/attachments-repository";
import { Attachment } from "@/domain/marketplace/enterprise/entities/attachment";

@Injectable()
export class PrismaSellersRepository implements SellersRepository {
  constructor(
    private prisma: PrismaService,
    private userAttachmentsRepository: UserAttachmentsRepository,
    private attachmentsRepository: AttachmentsRepository,
  ) {}

  async findById(id: string): Promise<Seller | null> {
    const seller = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!seller) {
      return null;
    }

    return PrismaSellerMapper.toDomain(seller);
  }

  async findWithAvatarById(id: string): Promise<UserWithAvatar | null> {
    const sellerWithAvatar = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        avatar: true,
      },
    });

    if (!sellerWithAvatar) {
      return null;
    }

    return PrismaUserWithAvatarMapper.toDomain(sellerWithAvatar);
  }

  async findByEmail(email: string): Promise<Seller | null> {
    const seller = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!seller) {
      return null;
    }

    return PrismaSellerMapper.toDomain(seller);
  }

  async findByPhone(phone: string): Promise<Seller | null> {
    const seller = await this.prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (!seller) {
      return null;
    }

    return PrismaSellerMapper.toDomain(seller);
  }

  async save(seller: Seller): Promise<UserWithAvatar> {
    const data = PrismaSellerMapper.toPrisma(seller);

    if (seller.avatar.getRemovedItems().length) {
      await this.userAttachmentsRepository.delete(
        seller.avatar.getRemovedItems()[0],
      );
    }

    if (seller.avatar.getNewItems().length) {
      await this.userAttachmentsRepository.create(
        seller.avatar.getNewItems()[0],
      );
    }

    const userWithAvatar = await this.prisma.user.update({
      where: {
        id: seller.id.toString(),
      },
      data,
      include: {
        avatar: true,
      },
    });

    return PrismaUserWithAvatarMapper.toDomain(userWithAvatar);
  }

  async create(seller: Seller): Promise<UserWithAvatar> {
    const data = PrismaSellerMapper.toPrisma(seller);

    await this.prisma.user.create({
      data,
    });

    let avatar: Attachment | null = null;

    const hasAvatar = seller.avatar.getItems().length > 0;

    if (hasAvatar) {
      const userAttachment = seller.avatar.getItems()[0];

      await this.userAttachmentsRepository.create(userAttachment);

      avatar = await this.attachmentsRepository.findById(
        userAttachment.attachmentId.toString(),
      );
    }

    const userWithAvatar = UserWithAvatar.create({
      userId: seller.id,
      name: seller.name,
      phone: seller.phone,
      email: seller.email,
      password: seller.password,
      avatar,
    });

    return userWithAvatar;
  }
}
