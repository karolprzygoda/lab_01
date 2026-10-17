import { connection } from "next/server";
import { created, ok, readJson, withErrorHandling } from "@/lib/http";
import { productService } from "@/services/product.service";

export const GET = withErrorHandling(async () => {
  await connection();
  return ok(await productService.list());
});

export const POST = withErrorHandling(async (request: Request) => {
  return created(await productService.create(await readJson(request)));
});
