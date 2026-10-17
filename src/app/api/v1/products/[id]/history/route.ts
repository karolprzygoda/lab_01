import { ok, readId, withErrorHandling, type IdRouteContext } from "@/lib/http";
import { productService } from "@/services/product.service";

export const GET = withErrorHandling(async (_request: Request, context: IdRouteContext) => {
  return ok(await productService.getHistory(await readId(context)));
});
