import "server-only";

import { prisma, type DbClient } from "@/server/db";

export class ForbiddenPhraseRepository {
  findAll(db: DbClient = prisma) {
    return db.forbiddenPhrase.findMany({ orderBy: { id: "asc" } });
  }

  findById(id: number, db: DbClient = prisma) {
    return db.forbiddenPhrase.findUnique({ where: { id } });
  }

  findByPhrase(phrase: string, db: DbClient = prisma) {
    return db.forbiddenPhrase.findUnique({ where: { phrase } });
  }

  create(phrase: string, db: DbClient = prisma) {
    return db.forbiddenPhrase.create({ data: { phrase } });
  }

  delete(id: number, db: DbClient = prisma) {
    return db.forbiddenPhrase.delete({ where: { id } });
  }
}

export const forbiddenPhraseRepository = new ForbiddenPhraseRepository();
