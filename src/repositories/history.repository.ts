import type { Prisma } from "@/generated/prisma/client";
import type { HistoryAction } from "@/generated/prisma/enums";
import { prisma, type DbClient } from "@/lib/prisma";

export type HistoryEntryData = {
  productId: number;
  action: HistoryAction;
  oldValue: Prisma.InputJsonObject | null;
  newValue: Prisma.InputJsonObject | null;
};

export class HistoryRepository {
  create({ oldValue, newValue, ...rest }: HistoryEntryData, db: DbClient = prisma) {
    return db.productHistory.create({
      data: { ...rest, oldValue: oldValue ?? undefined, newValue: newValue ?? undefined },
    });
  }

  findByProductId(productId: number, db: DbClient = prisma) {
    return db.productHistory.findMany({
      where: { productId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
  }
}

export const historyRepository = new HistoryRepository();
