import { beforeEach, describe, expect, it } from "vitest";
import { HistoryRepository } from "@/repositories/history.repository";
import { productRepository } from "@/repositories/product.repository";
import { ProductService } from "@/services/product.service";
import { api, createProduct, resetDatabase, validProduct } from "./helpers";

type HistoryEntry = {
  id: number;
  productId: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
};

describe("Product Change History & Atomicity", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("records CREATE, UPDATE and DELETE operations with old and new values and retains history after deletion", async () => {
    const created = await createProduct({
      name: "Monitor1",
      category: "ELECTRONICS",
      price: 1200,
      quantity: 5,
    });

    await api(`/products/${created.id}`, {
      method: "PUT",
      body: {
        name: "Monitor2",
        category: "ELECTRONICS",
        price: 1100,
        quantity: 8,
      },
    });

    await api(`/products/${created.id}`, { method: "DELETE" });

    const historyRes = await api<{ data: HistoryEntry[] }>(`/products/${created.id}/history`);
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.data).toHaveLength(3);

    const [createEntry, updateEntry, deleteEntry] = historyRes.body.data;

    expect(createEntry).toMatchObject({
      productId: created.id,
      action: "CREATE",
      oldValue: null,
      newValue: { name: "Monitor1", category: "ELECTRONICS", price: 1200, quantity: 5 },
    });

    expect(updateEntry).toMatchObject({
      productId: created.id,
      action: "UPDATE",
      oldValue: { name: "Monitor1", category: "ELECTRONICS", price: 1200, quantity: 5 },
      newValue: { name: "Monitor2", category: "ELECTRONICS", price: 1100, quantity: 8 },
    });

    expect(deleteEntry).toMatchObject({
      productId: created.id,
      action: "DELETE",
      oldValue: { name: "Monitor2", category: "ELECTRONICS", price: 1100, quantity: 8 },
      newValue: null,
    });
  });

  it("returns 404 for history of a product that never existed", async () => {
    const res = await api("/products/999/history");
    expect(res.status).toBe(404);
  });

  it("rolls back product creation when history write fails (atomic transaction)", async () => {
    class FailingHistoryRepository extends HistoryRepository {
      override create(): never {
        throw new Error("Simulated history storage failure");
      }
    }

    const serviceWithFailingHistory = new ProductService(
      productRepository,
      new FailingHistoryRepository(),
    );

    await expect(serviceWithFailingHistory.create(validProduct)).rejects.toThrow(
      "Simulated history storage failure",
    );

    const products = await productRepository.findAll();
    expect(products).toHaveLength(0);
  });
});
