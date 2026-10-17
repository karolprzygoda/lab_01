import { beforeEach, describe, expect, it } from "vitest";
import { api, createProduct, errorFields, resetDatabase, validProduct } from "./helpers";

describe("Forbidden Phrases", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("manages forbidden phrases via REST API and blocks matching product names on POST and PUT", async () => {
    const createPhrase = await api<{ data: { id: number; phrase: string } }>("/forbidden-phrases", {
      method: "POST",
      body: { phrase: "  SuperOkazja  " },
    });
    expect(createPhrase.status).toBe(201);
    expect(createPhrase.body.data.phrase).toBe("superokazja");

    const duplicatePhrase = await api("/forbidden-phrases", {
      method: "POST",
      body: { phrase: "SUPEROKAZJA" },
    });
    expect(duplicatePhrase.status).toBe(409);

    const listPhrases = await api<{ data: { id: number; phrase: string }[] }>("/forbidden-phrases");
    expect(listPhrases.status).toBe(200);
    expect(listPhrases.body.data).toHaveLength(1);

    const blockedPost = await api("/products", {
      method: "POST",
      body: { ...validProduct, name: "MojaSuperOkazja1" },
    });
    expect(blockedPost.status).toBe(400);
    expect(errorFields(blockedPost.body)).toContain("name");

    const allowedProduct = await createProduct({ name: "ZwyklyLaptop1" });

    const blockedPut = await api(`/products/${allowedProduct.id}`, {
      method: "PUT",
      body: { ...validProduct, name: "SuperOkazjaPro" },
    });
    expect(blockedPut.status).toBe(400);
    expect(errorFields(blockedPut.body)).toContain("name");

    const delPhrase = await api(`/forbidden-phrases/${createPhrase.body.data.id}`, {
      method: "DELETE",
    });
    expect(delPhrase.status).toBe(204);

    const nowAllowed = await api(`/products/${allowedProduct.id}`, {
      method: "PUT",
      body: { ...validProduct, name: "SuperOkazjaPro" },
    });
    expect(nowAllowed.status).toBe(200);
  });

  it("validates forbidden phrase input and returns 404 when deleting unknown phrase", async () => {
    const emptyRes = await api("/forbidden-phrases", {
      method: "POST",
      body: { phrase: "   " },
    });
    expect(emptyRes.status).toBe(400);
    expect(errorFields(emptyRes.body)).toContain("phrase");

    const delUnknown = await api("/forbidden-phrases/999", { method: "DELETE" });
    expect(delUnknown.status).toBe(404);
  });
});
