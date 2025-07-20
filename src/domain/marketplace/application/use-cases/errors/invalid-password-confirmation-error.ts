import { UseCaseError } from "@/core/errors/use-case-error";

export class InvalidPasswordConfirmationError
  extends Error
  implements UseCaseError
{
  constructor() {
    super(`Invalid password confirmation.`);
  }
}
