import { ok, readId, withErrorHandling, type IdRouteContext } from "@/server/api/http";
import { productService } from "@/server/services/product.service";

export const GET = withErrorHandling(async (_request: Request, context: IdRouteContext) => {
  return ok(await productService.getHistory(await readId(context)));
});
