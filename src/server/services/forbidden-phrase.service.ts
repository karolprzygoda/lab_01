import "server-only";

import { ConflictError, NotFoundError } from "@/server/errors";
import { isDatabaseError } from "@/server/database-errors";
import { prisma, type DbClient } from "@/server/db";
import { forbiddenPhraseInputSchema } from "@/server/validation/forbidden-phrase.schema";
import { validate } from "@/server/validation/validate";
import { validateId } from "@/server/validation/id.schema";
import {
  forbiddenPhraseRepository,
  type ForbiddenPhraseRepository,
} from "@/server/repositories/forbidden-phrase.repository";

export class ForbiddenPhraseService {
  constructor(private readonly phrases: ForbiddenPhraseRepository = forbiddenPhraseRepository) {}

  list() {
    return this.phrases.findAll();
  }

  async create(input: unknown) {
    const { phrase } = validate(forbiddenPhraseInputSchema, input);
    try {
      return await this.phrases.create(phrase);
    } catch (error) {
      if (isDatabaseError(error, "P2002")) {
        throw new ConflictError(`Zabroniona fraza "${phrase}" już istnieje`, [
          { field: "phrase", message: "Fraza musi być unikalna" },
        ]);
      }
      throw error;
    }
  }

  async delete(id: number) {
    validateId(id);
    try {
      await this.phrases.delete(id);
    } catch (error) {
      if (isDatabaseError(error, "P2025")) {
        throw new NotFoundError(`Nie znaleziono zabronionej frazy o id ${id}`);
      }
      throw error;
    }
  }

  async findContainedIn(text: string, db: DbClient = prisma) {
    const normalized = text.toLowerCase();
    const phrases = await this.phrases.findAll(db);
    return phrases.find(({ phrase }) => normalized.includes(phrase))?.phrase ?? null;
  }
}

export const forbiddenPhraseService = new ForbiddenPhraseService();
