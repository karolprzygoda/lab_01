import type { Product, ProductHistory } from "@/generated/prisma/client";
import type { Category, HistoryAction } from "@/generated/prisma/enums";

export type ProductDto = {
  id: number;
  name: string;
  category: Category;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type HistoryEntryDto = {
  id: number;
  productId: number;
  action: HistoryAction;
  oldValue: unknown;
  newValue: unknown;
  createdAt: string;
};

export function toProductDto(product: Product): ProductDto {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price.toNumber(),
    quantity: product.quantity,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export function toHistoryEntryDto(entry: ProductHistory): HistoryEntryDto {
  return {
    id: entry.id,
    productId: entry.productId,
    action: entry.action,
    oldValue: entry.oldValue,
    newValue: entry.newValue,
    createdAt: entry.createdAt.toISOString(),
  };
}
