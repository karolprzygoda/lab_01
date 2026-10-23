import { noContent, readId, withErrorHandling, type IdRouteContext } from "@/server/api/http";
import { forbiddenPhraseService } from "@/server/services/forbidden-phrase.service";

export const DELETE = withErrorHandling(async (_request: Request, context: IdRouteContext) => {
  await forbiddenPhraseService.delete(await readId(context));
  return noContent();
});
