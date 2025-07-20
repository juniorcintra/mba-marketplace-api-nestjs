import { Either, left, right } from "@/core/either";
import { Injectable } from "@nestjs/common";
import { Seller } from "../../enterprise/entities/user/seller";
import { SellersRepository } from "../repositories/sellers-repository";
import { HashGenerator } from "../cryptography/hash-generator";
import { EmailAlreadyExistsError } from "./errors/email-already-exists-error";
import { PhoneAlreadyExistsError } from "./errors/phone-already-exists-error";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { AttachmentsRepository } from "../repositories/attachments-repository";
import { UserAttachmentList } from "../../enterprise/entities/user/user-attachment-list";
import { UserAttachment } from "../../enterprise/entities/user/user-attachment";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InvalidPasswordConfirmationError } from "./errors/invalid-password-confirmation-error";
import { UserWithAvatar } from "../../enterprise/entities/value-objects/user-with-avatar";

interface RegisterSellerUseCaseRequest {
  name: string;
  phone: string;
  email: string;
  avatarId: string | null;
  password: string;
  passwordConfirmation: string;
}

type RegisterSellerUseCaseResponse = Either<
  | InvalidPasswordConfirmationError
  | EmailAlreadyExistsError
  | PhoneAlreadyExistsError
  | ResourceNotFoundError,
  {
    seller: UserWithAvatar;
  }
>;

@Injectable()
export class RegisterSellerUseCase {
  constructor(
    private sellersRepository: SellersRepository,
    private attachmentsRepository: AttachmentsRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    name,
    phone,
    email,
    avatarId,
    password,
    passwordConfirmation,
  }: RegisterSellerUseCaseRequest): Promise<RegisterSellerUseCaseResponse> {
    if (password !== passwordConfirmation) {
      return left(new InvalidPasswordConfirmationError());
    }

    const sellerWithSameEmail = await this.sellersRepository.findByEmail(email);

    if (sellerWithSameEmail) {
      return left(new EmailAlreadyExistsError(email));
    }

    const sellerWithSamePhone = await this.sellersRepository.findByPhone(phone);

    if (sellerWithSamePhone) {
      return left(new PhoneAlreadyExistsError(phone));
    }

    const attachment = avatarId
      ? await this.attachmentsRepository.findById(avatarId)
      : null;

    if (avatarId && !attachment) {
      return left(new ResourceNotFoundError());
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const seller = Seller.create({
      name,
      phone,
      email,
      password: hashedPassword,
    });

    if (avatarId) {
      const userAttachment = UserAttachment.create({
        attachmentId: new UniqueEntityID(avatarId),
        userId: seller.id,
      });

      seller.avatar = new UserAttachmentList([userAttachment]);
    }

    const sellerWithAvatar = await this.sellersRepository.create(seller);

    return right({
      seller: sellerWithAvatar,
    });
  }
}
