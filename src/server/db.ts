import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/env";
import { PrismaClient, type Prisma } from "@generated/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
    max: 1,
    idleTimeoutMillis: 1,
    connectionTimeoutMillis: 5_000,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type DbClient = Prisma.TransactionClient;
