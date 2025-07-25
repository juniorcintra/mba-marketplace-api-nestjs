import { UseCaseError } from "@/core/errors/use-case-error";

export class EmailAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Email "${identifier}" already exists.`);
  }
}
