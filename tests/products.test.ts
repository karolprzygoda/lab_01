import { beforeEach, describe, expect, it } from "vitest";
import { api, createProduct, errorFields, resetDatabase, validProduct } from "./helpers";

describe("Products CRUD & Validation", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("lists empty products initially", async () => {
    const res = await api<{ data: unknown[] }>("/products");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("creates, gets, lists, updates and deletes a product", async () => {
    const created = await createProduct();
    expect(created).toMatchObject({
      name: validProduct.name,
      category: validProduct.category,
      price: validProduct.price,
      quantity: validProduct.quantity,
    });

    const getRes = await api<{ data: typeof created }>(`/products/${created.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data).toEqual(created);

    const listRes = await api<{ data: (typeof created)[] }>("/products");
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);

    const updateRes = await api<{ data: typeof created }>(`/products/${created.id}`, {
      method: "PUT",
      body: {
        name: "NowaKsiazka1",
        category: "BOOKS",
        price: 49.99,
        quantity: 25,
      },
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data).toMatchObject({
      id: created.id,
      name: "NowaKsiazka1",
      category: "BOOKS",
      price: 49.99,
      quantity: 25,
    });

    const delRes = await api(`/products/${created.id}`, { method: "DELETE" });
    expect(delRes.status).toBe(204);

    const afterDel = await api(`/products/${created.id}`);
    expect(afterDel.status).toBe(404);
  });

  it("returns 404 for non-existent product on GET, PUT, DELETE", async () => {
    expect((await api("/products/999")).status).toBe(404);
    expect((await api("/products/999", { method: "PUT", body: validProduct })).status).toBe(404);
    expect((await api("/products/999", { method: "DELETE" })).status).toBe(404);
  });

  it("validates invalid id parameter", async () => {
    const res = await api("/products/abc");
    expect(res.status).toBe(400);
    expect(errorFields(res.body)).toContain("id");
  });

  it("enforces unique product name (case-insensitive) on POST and PUT", async () => {
    const first = await createProduct({ name: "Telefon1" });
    const second = await createProduct({ name: "Kurtka2", category: "CLOTHING", price: 200 });

    const duplicatePost = await api("/products", {
      method: "POST",
      body: { ...validProduct, name: "telefon1" },
    });
    expect(duplicatePost.status).toBe(409);
    expect(errorFields(duplicatePost.body)).toContain("name");

    const duplicatePut = await api(`/products/${second.id}`, {
      method: "PUT",
      body: { ...validProduct, name: "TELEFON1" },
    });
    expect(duplicatePut.status).toBe(409);

    const selfPut = await api(`/products/${first.id}`, {
      method: "PUT",
      body: { ...validProduct, name: "Telefon1", quantity: 99 },
    });
    expect(selfPut.status).toBe(200);
  });

  it("validates name length and alphanumeric characters", async () => {
    for (const invalidName of ["ab", "A".repeat(21), "Laptop Pro", "Laptop-1", "Tel@1"]) {
      const res = await api("/products", {
        method: "POST",
        body: { ...validProduct, name: invalidName },
      });
      expect(res.status).toBe(400);
      expect(errorFields(res.body)).toContain("name");
    }
  });

  it("validates price ranges per category", async () => {
    const cases = [
      { category: "ELECTRONICS", invalid: [49.99, 50000.01], valid: [50, 50000] },
      { category: "BOOKS", invalid: [4.99, 500.01], valid: [5, 500] },
      { category: "CLOTHING", invalid: [9.99, 5000.01], valid: [10, 5000] },
    ] as const;

    let counter = 1;
    for (const { category, invalid, valid } of cases) {
      for (const price of invalid) {
        const res = await api("/products", {
          method: "POST",
          body: { name: `Prod${counter++}`, category, price, quantity: 1 },
        });
        expect(res.status).toBe(400);
        expect(errorFields(res.body)).toContain("price");
      }
      for (const price of valid) {
        const res = await api("/products", {
          method: "POST",
          body: { name: `Prod${counter++}`, category, price, quantity: 1 },
        });
        expect(res.status).toBe(201);
      }
    }
  });

  it("validates quantity as integer >= 0 and reports multiple field errors simultaneously", async () => {
    const res = await api("/products", {
      method: "POST",
      body: { name: "x", category: "BOOKS", price: 999, quantity: -1.5 },
    });
    expect(res.status).toBe(400);
    const fields = errorFields(res.body);
    expect(fields).toContain("name");
    expect(fields).toContain("price");
    expect(fields).toContain("quantity");
  });
});
