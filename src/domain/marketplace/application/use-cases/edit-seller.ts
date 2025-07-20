import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { SellersRepository } from "../repositories/sellers-repository";
import { HashGenerator } from "../cryptography/hash-generator";
import { EmailAlreadyExistsError } from "./errors/email-already-exists-error";
import { PhoneAlreadyExistsError } from "./errors/phone-already-exists-error";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { AttachmentsRepository } from "../repositories/attachments-repository";
import { WrongCredentialsError } from "./errors/wrong-credentials-error";
import { InvalidNewPasswordError } from "./errors/invalid-new-password-error";
import { HashComparer } from "../cryptography/hash-comparer";
import { UserAttachmentsRepository } from "../repositories/user-attachments-repository";
import { UserAttachmentList } from "../../enterprise/entities/user/user-attachment-list";
import { UserAttachment } from "../../enterprise/entities/user/user-attachment";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { UserWithAvatar } from "../../enterprise/entities/value-objects/user-with-avatar";

interface EditSellerUseCaseRequest {
  sellerId: string;
  name: string;
  phone: string;
  email: string;
  avatarId?: string;
  password?: string;
  newPassword?: string;
}

type EditSellerUseCaseResponse = Either<
  | EmailAlreadyExistsError
  | PhoneAlreadyExistsError
  | ResourceNotFoundError
  | InvalidNewPasswordError,
  {
    seller: UserWithAvatar;
  }
>;

@Injectable()
export class EditSellerUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private attachmentsRepository: AttachmentsRepository,
    private userAttachmentsRepository: UserAttachmentsRepository,
    private hashGenerator: HashGenerator,
    private hashComparer: HashComparer,
  ) {}

  async execute({
    sellerId,
    name,
    phone,
    email,
    avatarId,
    password,
    newPassword,
  }: EditSellerUseCaseRequest): Promise<EditSellerUseCaseResponse> {
    const seller = await this.sellersRepository.findById(sellerId);

    if (!seller) {
      return left(new ResourceNotFoundError());
    }

    const sellerWithSameEmail = await this.sellersRepository.findByEmail(email);

    if (sellerWithSameEmail) {
      if (sellerWithSameEmail.id.toString() !== sellerId) {
        return left(new EmailAlreadyExistsError(email));
      }
    }
    const sellerWithSamePhone = await this.sellersRepository.findByPhone(phone);

    if (sellerWithSamePhone) {
      if (sellerWithSamePhone.id.toString() !== sellerId) {
        return left(new PhoneAlreadyExistsError(phone));
      }
    }

    if (avatarId) {
      const avatar = await this.attachmentsRepository.findById(avatarId);

      if (!avatar) {
        return left(new ResourceNotFoundError());
      }

      const currentSellerAvatar =
        await this.userAttachmentsRepository.findByUserId(sellerId);

      const currentSellerAvatarId = currentSellerAvatar?.id.toString();

      if (currentSellerAvatarId !== avatarId) {
        const sellerAvatar = UserAttachment.create({
          attachmentId: new UniqueEntityID(avatarId),
          userId: seller.id,
        });

        const userAttachmentList = currentSellerAvatar
          ? new UserAttachmentList([currentSellerAvatar])
          : new UserAttachmentList();

        userAttachmentList.update([sellerAvatar]);

        seller.avatar = userAttachmentList;
      }
    }

    if (newPassword) {
      if (!password) {
        return left(new WrongCredentialsError());
      }

      if (newPassword === password) {
        return left(new InvalidNewPasswordError());
      }

      const isPasswordValid = await this.hashComparer.compare(
        password,
        seller.password,
      );

      if (!isPasswordValid) {
        return left(new WrongCredentialsError());
      }

      const hashedNewPassword = await this.hashGenerator.hash(newPassword);

      seller.password = hashedNewPassword;
    }

    seller.name = name;
    seller.phone = phone;
    seller.email = email;

    const sellerWithAvatar = await this.sellersRepository.save(seller);

    return right({
      seller: sellerWithAvatar,
    });
  }
}
