import "server-only";

import type { Product, ProductHistory } from "@generated/client";
import type { ProductDto, HistoryEntryDto } from "@/lib/product-types";

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
