import { ProductAttachment } from "../../enterprise/entities/product-attachment";

export abstract class ProductAttachmentsRepository {
  abstract findManyByProductId(productId: string): Promise<ProductAttachment[]>;
  abstract createMany(attachments: ProductAttachment[]): Promise<void>;
  abstract deleteMany(attachments: ProductAttachment[]): Promise<void>;
}
