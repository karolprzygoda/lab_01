import { noContent, readId, withErrorHandling, type IdRouteContext } from "@/lib/http";
import { forbiddenPhraseService } from "@/services/forbidden-phrase.service";

export const DELETE = withErrorHandling(async (_request: Request, context: IdRouteContext) => {
  await forbiddenPhraseService.delete(await readId(context));
  return noContent();
});
