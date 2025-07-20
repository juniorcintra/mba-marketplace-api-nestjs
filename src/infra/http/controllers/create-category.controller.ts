import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { CreateCategoryUseCase } from "@/domain/marketplace/application/use-cases/create-category";

const createCategoryBodySchema = z.object({
  title: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(createCategoryBodySchema);

type CreateCategoryBodySchema = z.infer<typeof createCategoryBodySchema>;

@Controller("/categories")
export class CreateCategoryController {
  constructor(private createCategory: CreateCategoryUseCase) {}

  @Post()
  async handle(@Body(bodyValidationPipe) body: CreateCategoryBodySchema) {
    const { title } = body;

    const result = await this.createCategory.execute({
      title,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }
  }
}
