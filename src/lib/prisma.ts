import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "@generated/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // Local Prisma Postgres serves one connection at a time. Release idle
  // connections promptly so the app, CLI and test process can share an instance.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    idleTimeoutMillis: 1,
    connectionTimeoutMillis: 5_000,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type DbClient = Prisma.TransactionClient;
