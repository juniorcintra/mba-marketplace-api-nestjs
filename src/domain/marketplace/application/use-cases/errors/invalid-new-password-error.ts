import { UseCaseError } from "@/core/errors/use-case-error";

export class InvalidNewPasswordError extends Error implements UseCaseError {
  constructor() {
    super(`New password must be diferent.`);
  }
}
