import { z } from "zod";
import { Category } from "@/generated/prisma/enums";
import { ValidationError } from "@/lib/errors";

export { Category };

export const PRICE_RANGES: Record<Category, { min: number; max: number }> = {
  ELECTRONICS: { min: 50, max: 50_000 },
  BOOKS: { min: 5, max: 500 },
  CLOTHING: { min: 10, max: 5_000 },
};

const CATEGORY_NAMES: Record<Category, string> = {
  ELECTRONICS: "Elektronika",
  BOOKS: "Książki",
  CLOTHING: "Odzież",
};

const categorySchema = z.enum(Category, {
  error: `Kategoria musi być jedną z wartości: ${Object.values(Category).join(", ")}`,
});

const priceSchema = z
  .number({ error: "Cena musi być liczbą" })
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6, {
    message: "Cena może mieć maksymalnie 2 miejsca po przecinku",
  });

export const productBaseSchema = z.object({
  name: z
    .string({ error: "Nazwa musi być tekstem" })
    .trim()
    .min(3, "Nazwa musi mieć co najmniej 3 znaki")
    .max(20, "Nazwa może mieć maksymalnie 20 znaków")
    .regex(/^[\p{L}\p{N}]+$/u, "Nazwa może zawierać wyłącznie litery i cyfry"),
  category: categorySchema,
  price: priceSchema,
  quantity: z
    .number({ error: "Ilość musi być liczbą" })
    .int("Ilość musi być liczbą całkowitą")
    .min(0, "Ilość musi być większa lub równa 0"),
});

export function checkCategoryPriceIssue(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;
  const categoryResult = categorySchema.safeParse(record.category);
  const priceResult = priceSchema.safeParse(record.price);
  if (!categoryResult.success || !priceResult.success) return null;
  const category = categoryResult.data;
  const price = priceResult.data;
  const { min, max } = PRICE_RANGES[category];
  if (price < min || price > max) {
    return {
      field: "price",
      message: `Cena dla kategorii ${CATEGORY_NAMES[category]} (${category}) musi mieścić się w przedziale ${min}–${max} PLN`,
    };
  }
  return null;
}

export function validateProductInput(input: unknown): ProductInput {
  const result = productBaseSchema.safeParse(input);
  const priceIssue = checkCategoryPriceIssue(input);
  if (!result.success || priceIssue) {
    const details = (result.success ? [] : result.error.issues).map((issue) => ({
      field: issue.path.length ? issue.path.join(".") : "body",
      message: issue.message,
    }));
    if (priceIssue) {
      details.push(priceIssue);
    }
    throw new ValidationError(details);
  }
  return result.data;
}

export type ProductInput = z.infer<typeof productBaseSchema>;
