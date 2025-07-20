import { SellersRepository } from "@/domain/marketplace/application/repositories/sellers-repository";
import { Seller } from "@/domain/marketplace/enterprise/entities/user/seller";
import { UserWithAvatar } from "@/domain/marketplace/enterprise/entities/value-objects/user-with-avatar";
import { InMemoryUserAttachmentsRepository } from "./in-memory-user-attachments-repository";
import { InMemoryAttachmentsRepository } from "./in-memory-attachments-repository";
import { Attachment } from "@/domain/marketplace/enterprise/entities/attachment";

export class InMemorySellersRepository implements SellersRepository {
  public items: Seller[] = [];

  constructor(
    private userAttachmentsRepository: InMemoryUserAttachmentsRepository,
    private attachmentsRepository: InMemoryAttachmentsRepository,
  ) {}

  async findById(id: string) {
    const seller = this.items.find((item) => item.id.toString() === id);

    if (!seller) {
      return null;
    }

    return seller;
  }

  async findWithAvatarById(id: string) {
    const seller = this.items.find((item) => item.id.toString() === id);

    if (!seller) {
      return null;
    }

    let avatar: Attachment | null = null;

    const sellerAttachment = await this.userAttachmentsRepository.findByUserId(
      seller.id.toString(),
    );

    if (sellerAttachment) {
      avatar = await this.attachmentsRepository.findById(
        sellerAttachment.attachmentId.toString(),
      );
    }

    const sellerWithAvatar = UserWithAvatar.create({
      userId: seller.id,
      name: seller.name,
      phone: seller.phone,
      email: seller.email,
      password: seller.password,
      avatar,
    });

    return sellerWithAvatar;
  }

  async findByEmail(email: string) {
    const seller = this.items.find((item) => item.email === email);

    if (!seller) {
      return null;
    }

    return seller;
  }

  async findByPhone(phone: string) {
    const seller = this.items.find((item) => item.phone === phone);

    if (!seller) {
      return null;
    }

    return seller;
  }

  async save(seller: Seller) {
    const itemIndex = this.items.findIndex((item) => item.id === seller.id);

    this.items[itemIndex] = seller;

    const hasNewAvatar = seller.avatar.getNewItems().length > 0;
    const hasOldAvatar = seller.avatar.getRemovedItems().length > 0;
    let sellerAvatar: Attachment | null = null;

    if (hasNewAvatar) {
      const newAvatar = seller.avatar.getNewItems()[0];

      await this.userAttachmentsRepository.create(newAvatar);

      sellerAvatar = await this.attachmentsRepository.findById(
        newAvatar.attachmentId.toString(),
      );
    }

    if (hasOldAvatar) {
      const oldAvatar = seller.avatar.getRemovedItems()[0];

      await this.userAttachmentsRepository.delete(oldAvatar);
    }

    const sellerWithAvatar = UserWithAvatar.create({
      userId: seller.id,
      name: seller.name,
      phone: seller.phone,
      email: seller.email,
      password: seller.password,
      avatar: sellerAvatar,
    });

    return sellerWithAvatar;
  }

  async create(seller: Seller) {
    this.items.push(seller);

    const hasAvatar = seller.avatar.getItems().length > 0;
    let sellerAvatar: Attachment | null = null;

    if (hasAvatar) {
      const sellerAttachment = seller.avatar.getItems()[0];

      await this.userAttachmentsRepository.create(sellerAttachment);

      sellerAvatar = await this.attachmentsRepository.findById(
        sellerAttachment.attachmentId.toString(),
      );
    }

    const sellerWithAvatar = UserWithAvatar.create({
      userId: seller.id,
      name: seller.name,
      phone: seller.phone,
      email: seller.email,
      password: seller.password,
      avatar: sellerAvatar,
    });

    return sellerWithAvatar;
  }
}
