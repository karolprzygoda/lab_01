import "server-only";

import type { z } from "zod";
import { ValidationError } from "@/server/errors";

export function validate<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => ({
        field: issue.path.length ? issue.path.join(".") : "body",
        message: issue.message,
      })),
    );
  }
  return result.data;
}
