import type { Category, HistoryAction } from "@generated/enums";

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
