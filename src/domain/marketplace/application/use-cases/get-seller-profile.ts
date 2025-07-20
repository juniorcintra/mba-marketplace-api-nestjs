import { SellersRepository } from "../repositories/sellers-repository";
import { Either, left, right } from "@/core/either";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { Injectable } from "@nestjs/common";
import { UserWithAvatar } from "../../enterprise/entities/value-objects/user-with-avatar";

interface GetSellerProfileUseCaseRequest {
  id: string;
}

type GetSellerProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    seller: UserWithAvatar;
  }
>;

@Injectable()
export class GetSellerProfileUseCase {
  constructor(private sellersRepository: SellersRepository) {}

  async execute({
    id,
  }: GetSellerProfileUseCaseRequest): Promise<GetSellerProfileUseCaseResponse> {
    const seller = await this.sellersRepository.findWithAvatarById(id);

    if (!seller) {
      return left(new ResourceNotFoundError());
    }

    return right({
      seller,
    });
  }
}
