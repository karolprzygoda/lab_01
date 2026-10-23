import type { Category } from "@generated/enums";

export const MAX_DATABASE_INT = 2_147_483_647;

export const PRICE_RANGES: Record<Category, { min: number; max: number }> = {
  ELECTRONICS: { min: 50, max: 50_000 },
  BOOKS: { min: 5, max: 500 },
  CLOTHING: { min: 10, max: 5_000 },
};

export const CATEGORY_NAMES: Record<Category, string> = {
  ELECTRONICS: "Elektronika", BOOKS: "Książki", CLOTHING: "Odzież",
};
