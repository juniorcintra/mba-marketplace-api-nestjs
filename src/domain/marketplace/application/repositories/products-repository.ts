import { PaginationParams } from "@/core/repositories/pagination-params";
import { Product } from "../../enterprise/entities/product";
import { ProductDetails } from "../../enterprise/entities/value-objects/product-details";

export interface Count {
  sellerId: string;
  from?: Date;
  status?: Product["status"];
}

export interface FindManyByOwner {
  ownerId: string;
  search?: string;
  status?: Product["status"];
}

export interface FindMany extends PaginationParams {
  search?: string;
  status?: Product["status"];
}

export abstract class ProductsRepository {
  abstract count(params: Count): Promise<number>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findDetailsById(id: string): Promise<ProductDetails | null>;
  abstract findManyByOwner(params: FindManyByOwner): Promise<Product[]>;
  abstract findManyWithDetailsByOwner(
    params: FindManyByOwner,
  ): Promise<ProductDetails[]>;

  abstract findMany(params: FindMany): Promise<Product[]>;
  abstract findManyWithDetails(params: FindMany): Promise<ProductDetails[]>;
  abstract save(product: Product): Promise<ProductDetails>;
  abstract create(product: Product): Promise<ProductDetails>;
}
