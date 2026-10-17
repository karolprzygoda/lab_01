import { z } from "zod";

export const forbiddenPhraseInputSchema = z.object({
  phrase: z
    .string({ error: "Fraza musi być tekstem" })
    .trim()
    .min(1, "Fraza nie może być pusta")
    .max(50, "Fraza może mieć maksymalnie 50 znaków")
    .transform((phrase) => phrase.toLowerCase()),
});

export type ForbiddenPhraseInput = z.infer<typeof forbiddenPhraseInputSchema>;
