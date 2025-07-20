import { Category } from "@/domain/marketplace/enterprise/entities/category";

export class CategoryPresenter {
  static toHTTP(category: Category) {
    return {
      id: category.id.toString(),
      title: category.title,
      slug: category.slug.value,
    };
  }
}
