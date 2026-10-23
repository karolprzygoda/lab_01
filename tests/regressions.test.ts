import { beforeEach, describe, expect, it } from "vitest";
import { api, createProduct, errorFields, resetDatabase, validProduct } from "./helpers";

type Product = typeof validProduct & { id: number };
type Entry = { action: string; oldValue: Product | null; newValue: Product | null };

describe("Product regression scenarios over HTTP", () => {
  beforeEach(resetDatabase);

  it("allows only one concurrent creation of a case-insensitive name", async () => {
    const responses = await Promise.all(
      ["RaceProduct", "raceproduct", "RACEPRODUCT", "rAcEpRoDuCt"].map((name) =>
        api("/products", { method: "POST", body: { ...validProduct, name } }),
      ),
    );
    expect(responses.map(({ status }) => status).sort()).toEqual([201, 409, 409, 409]);
    for (const response of responses.filter(({ status }) => status === 409)) {
      expect(errorFields(response.body)).toContain("name");
    }
    const products = await api<{ data: Product[] }>("/products");
    expect(products.body.data).toHaveLength(1);
  });

  it("allows only one concurrent rename to a case-insensitive name", async () => {
    const products = await Promise.all(
      ["FirstProduct", "SecondProduct"].map((name) => createProduct({ name })),
    );
    const responses = await Promise.all(
      products.map(({ id }, index) => api(`/products/${id}`, {
        method: "PUT",
        body: { ...validProduct, name: index ? "targetname" : "TargetName" },
      })),
    );
    expect(responses.map(({ status }) => status).sort()).toEqual([200, 409]);
    expect(errorFields(responses.find(({ status }) => status === 409)!.body)).toContain("name");
  });

  it("records a continuous history for concurrent updates", async () => {
    const product = await createProduct({ quantity: 0 });
    const updates = await Promise.all(
      Array.from({ length: 8 }, (_, index) => api(`/products/${product.id}`, {
        method: "PUT", body: { ...validProduct, quantity: index + 1 },
      })),
    );
    expect(updates.map(({ status }) => status)).toEqual(Array(8).fill(200));
    const history = await api<{ data: Entry[] }>(`/products/${product.id}/history`);
    expect(history.body.data).toHaveLength(9);
    for (let index = 1; index < history.body.data.length; index++) {
      expect(history.body.data[index].oldValue).toEqual(history.body.data[index - 1].newValue);
    }
    const current = await api<{ data: Product }>(`/products/${product.id}`);
    expect(history.body.data.at(-1)?.newValue?.quantity).toBe(current.body.data.quantity);
  });

  it.each(["POST", "PUT"])("rejects non-digit numeric characters and overflowing quantity on %s", async (method) => {
    const product = method === "PUT" ? await createProduct() : null;
    const path = product ? `/products/${product.id}` : "/products";
    for (const [field, value] of [["name", "A½B"], ["quantity", 2147483648]] as const) {
      const response = await api(path, { method, body: { ...validProduct, [field]: value } });
      expect(response.status).toBe(400);
      expect(errorFields(response.body)).toContain(field);
    }
  });

  it.each(["2147483648", "0", "-1", "1.5", "abc"])("rejects invalid ID %s on every parameterized route", async (id) => {
    for (const method of ["GET", "PUT", "DELETE"]) {
      const response = await api(`/products/${id}`, {
        method, ...(method === "PUT" ? { body: validProduct } : {}),
      });
      expect(response.status).toBe(400);
      expect(errorFields(response.body)).toContain("id");
    }
    expect((await api(`/products/${id}/history`)).status).toBe(400);
    expect((await api(`/forbidden-phrases/${id}`, { method: "DELETE" })).status).toBe(400);
  });
});
