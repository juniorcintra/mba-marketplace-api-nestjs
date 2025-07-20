import { Seller } from "../../enterprise/entities/user/seller";
import { UserWithAvatar } from "../../enterprise/entities/value-objects/user-with-avatar";

export abstract class SellersRepository {
  abstract findById(id: string): Promise<Seller | null>;
  abstract findWithAvatarById(id: string): Promise<UserWithAvatar | null>;
  abstract findByEmail(email: string): Promise<Seller | null>;
  abstract findByPhone(phone: string): Promise<Seller | null>;
  abstract save(seller: Seller): Promise<UserWithAvatar>;
  abstract create(seller: Seller): Promise<UserWithAvatar>;
}
