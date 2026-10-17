import { inject } from "vitest";
import { prisma } from "@/lib/prisma";

type ApiResponse<T = unknown> = { status: number; body: T };

export type FieldErrorBody = {
  error: { code: string; message: string; details?: { field: string; message: string }[] };
};

export async function api<T = unknown>(
  path: string,
  { method = "GET", body }: { method?: string; body?: unknown } = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(`${inject("baseUrl")}/api/v1${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  const text = await response.text();
  return { status: response.status, body: (text ? JSON.parse(text) : null) as T };
}

export function errorFields(body: unknown) {
  return ((body as FieldErrorBody).error.details ?? []).map(({ field }) => field);
}

export const validProduct = {
  name: "Laptop123",
  category: "ELECTRONICS",
  price: 3999.99,
  quantity: 10,
};

export async function createProduct(overrides: Partial<typeof validProduct> = {}) {
  const { status, body } = await api<{ data: { id: number } & typeof validProduct }>("/products", {
    method: "POST",
    body: { ...validProduct, ...overrides },
  });
  if (status !== 201) {
    throw new Error(`Failed to create product: ${status} ${JSON.stringify(body)}`);
  }
  return body.data;
}

export async function resetDatabase() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Product", "ProductHistory", "ForbiddenPhrase" RESTART IDENTITY CASCADE',
  );
}
