import { beforeEach, describe, expect, it } from "vitest";
import { HistoryRepository } from "@/server/repositories/history.repository";
import { productRepository } from "@/server/repositories/product.repository";
import { ProductService } from "@/server/services/product.service";
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

  it.each(["update", "delete"] as const)("rolls back %s when history write fails", async (operation) => {
    const created = await createProduct();
    const before = await api(`/products/${created.id}`);
    const beforeHistory = await api(`/products/${created.id}/history`);
    class FailingHistoryRepository extends HistoryRepository {
      override create(): never { throw new Error("History unavailable"); }
    }
    const service = new ProductService(productRepository, new FailingHistoryRepository());
    await expect(operation === "update"
      ? service.update(created.id, { ...validProduct, quantity: 99 })
      : service.delete(created.id)).rejects.toThrow("History unavailable");
    expect((await api(`/products/${created.id}`)).body).toEqual(before.body);
    expect((await api(`/products/${created.id}/history`)).body).toEqual(beforeHistory.body);
  });

  it("keeps a continuous history when updating and deleting concurrently", async () => {
    const created = await createProduct();
    const [update, removal] = await Promise.all([
      api(`/products/${created.id}`, { method: "PUT", body: { ...validProduct, quantity: 99 } }),
      api(`/products/${created.id}`, { method: "DELETE" }),
    ]);
    expect([200, 404]).toContain(update.status);
    expect(removal.status).toBe(204);
    const history = await api<{ data: HistoryEntry[] }>(`/products/${created.id}/history`);
    expect(history.body.data).toHaveLength(update.status === 200 ? 3 : 2);
    for (let index = 1; index < history.body.data.length; index++) {
      expect(history.body.data[index].oldValue).toEqual(history.body.data[index - 1].newValue);
    }
    expect(history.body.data.at(-1)?.action).toBe("DELETE");
    expect((await api(`/products/${created.id}`)).status).toBe(404);
  });
});
