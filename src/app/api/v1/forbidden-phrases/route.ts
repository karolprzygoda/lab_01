import { connection } from "next/server";
import { created, ok, readJson, withErrorHandling } from "@/server/api/http";
import { forbiddenPhraseService } from "@/server/services/forbidden-phrase.service";

export const GET = withErrorHandling(async () => {
  await connection();
  return ok(await forbiddenPhraseService.list());
});

export const POST = withErrorHandling(async (request: Request) => {
  return created(await forbiddenPhraseService.create(await readJson(request)));
});
