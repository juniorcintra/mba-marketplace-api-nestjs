import { Product } from "@/domain/marketplace/enterprise/entities/product";

export class ProductPresenter {
  static toHTTP(product: Product) {
    return {
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      status: product.status,
      owner: product.ownerId.toString(),
      category: product.categoryId.toString(),
    };
  }
}
