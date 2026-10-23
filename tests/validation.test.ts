import { beforeEach, describe, expect, it } from "vitest";
import { api, createProduct, errorFields, resetDatabase, validProduct } from "./helpers";

describe.each(["POST", "PUT"])("Complete product validation on %s", (method) => {
  let path: string;
  beforeEach(async () => {
    await resetDatabase();
    path = method === "POST" ? "/products" : `/products/${(await createProduct()).id}`;
  });

  it.each(["ab", "A".repeat(21), "Laptop Pro", "Laptop-1", "A½B"])("rejects invalid name %s", async (name) => {
    const response = await api(path, { method, body: { ...validProduct, name } });
    expect(response.status).toBe(400);
    expect(errorFields(response.body)).toContain("name");
  });

  it.each(["Ab1", "A".repeat(20), "Żółw123", "𐐀𐐁𐐂"])("accepts valid name %s", async (name) => {
    const response = await api(path, { method, body: { ...validProduct, name } });
    expect(response.status).toBe(method === "POST" ? 201 : 200);
  });

  it.each([
    ["ELECTRONICS", 49.99, false], ["ELECTRONICS", 50, true],
    ["ELECTRONICS", 50000, true], ["ELECTRONICS", 50000.01, false],
    ["BOOKS", 4.99, false], ["BOOKS", 5, true], ["BOOKS", 500, true], ["BOOKS", 500.01, false],
    ["CLOTHING", 9.99, false], ["CLOTHING", 10, true],
    ["CLOTHING", 5000, true], ["CLOTHING", 5000.01, false],
  ])("enforces the %s price boundary %s", async (category, price, valid) => {
    const response = await api(path, { method, body: { ...validProduct, category, price } });
    expect(response.status).toBe(valid ? (method === "POST" ? 201 : 200) : 400);
    if (!valid) expect(errorFields(response.body)).toContain("price");
  });

  it.each([-1, 1.5, 2147483648])("rejects invalid quantity %s", async (quantity) => {
    const response = await api(path, { method, body: { ...validProduct, quantity } });
    expect(response.status).toBe(400);
    expect(errorFields(response.body)).toContain("quantity");
  });

  it.each([0, 2147483647])("accepts quantity boundary %s", async (quantity) => {
    const response = await api<{ data: { quantity: number } }>(path, {
      method, body: { ...validProduct, quantity },
    });
    expect(response.status).toBe(method === "POST" ? 201 : 200);
    expect(response.body.data.quantity).toBe(quantity);
  });

  it.each(["name", "category", "price", "quantity"] as const)("requires %s", async (field) => {
    const body: Partial<typeof validProduct> = { ...validProduct };
    delete body[field];
    const response = await api(path, { method, body });
    expect(response.status).toBe(400);
    expect(errorFields(response.body)).toContain(field);
  });

  it.each([
    ["name", 123], ["category", "FOOD"], ["price", "100"], ["quantity", "10"], ["price", 50.001],
  ])("rejects an invalid type or value in %s", async (field, value) => {
    const response = await api(path, { method, body: { ...validProduct, [field]: value } });
    expect(response.status).toBe(400);
    expect(errorFields(response.body)).toContain(field);
  });

  it("rejects malformed JSON", async () => {
    const response = await api(path, { method, body: "{" });
    expect(response.status).toBe(400);
    expect(errorFields(response.body)).toContain("body");
  });

  it("does not change a product or history when validation fails", async () => {
    const beforeProducts = await api("/products");
    const beforeHistory = method === "PUT" ? await api(`${path}/history`) : null;
    expect((await api(path, { method, body: { ...validProduct, quantity: -1 } })).status).toBe(400);
    expect((await api("/products")).body).toEqual(beforeProducts.body);
    if (beforeHistory) expect((await api(`${path}/history`)).body).toEqual(beforeHistory.body);
  });
});
