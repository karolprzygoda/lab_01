import { Prisma } from "@generated/client";

export function isDatabaseError(error: unknown, code: string) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}
