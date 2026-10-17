import { noContent, ok, readId, readJson, withErrorHandling, type IdRouteContext } from "@/lib/http";
import { productService } from "@/services/product.service";

export const GET = withErrorHandling(async (_request: Request, context: IdRouteContext) => {
  return ok(await productService.get(await readId(context)));
});

export const PUT = withErrorHandling(async (request: Request, context: IdRouteContext) => {
  const id = await readId(context);
  return ok(await productService.update(id, await readJson(request)));
});

export const DELETE = withErrorHandling(async (_request: Request, context: IdRouteContext) => {
  await productService.delete(await readId(context));
  return noContent();
});
