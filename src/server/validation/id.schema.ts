import "server-only";

import { z } from "zod";
import { validate } from "@/server/validation/validate";
import { MAX_DATABASE_INT } from "@/lib/product-rules";

const message = `Identyfikator musi być liczbą całkowitą od 1 do ${MAX_DATABASE_INT}`;

const idSchema = z.object({
  id: z.union([
    z.number({ error: message }),
    z.string({ error: message }).regex(/^\d+$/, message).transform(Number),
  ], { error: message })
    .pipe(z.number({ error: message }).int(message).min(1, message).max(MAX_DATABASE_INT, message)),
});

export function validateId(input: unknown): number {
  return validate(idSchema, { id: input }).id;
}
