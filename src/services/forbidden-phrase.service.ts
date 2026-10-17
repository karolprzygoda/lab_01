import { ConflictError, NotFoundError } from "@/lib/errors";
import { prisma, type DbClient } from "@/lib/prisma";
import { forbiddenPhraseInputSchema } from "@/lib/validation/forbidden-phrase.schema";
import { validate } from "@/lib/validation/validate";
import {
  forbiddenPhraseRepository,
  type ForbiddenPhraseRepository,
} from "@/repositories/forbidden-phrase.repository";

export class ForbiddenPhraseService {
  constructor(private readonly phrases: ForbiddenPhraseRepository = forbiddenPhraseRepository) {}

  list() {
    return this.phrases.findAll();
  }

  async create(input: unknown) {
    const { phrase } = validate(forbiddenPhraseInputSchema, input);
    if (await this.phrases.findByPhrase(phrase)) {
      throw new ConflictError(`Zabroniona fraza "${phrase}" już istnieje`, [
        { field: "phrase", message: "Fraza musi być unikalna" },
      ]);
    }
    return this.phrases.create(phrase);
  }

  async delete(id: number) {
    if (!(await this.phrases.findById(id))) {
      throw new NotFoundError(`Nie znaleziono zabronionej frazy o id ${id}`);
    }
    await this.phrases.delete(id);
  }

  async findContainedIn(text: string, db: DbClient = prisma) {
    const normalized = text.toLowerCase();
    const phrases = await this.phrases.findAll(db);
    return phrases.find(({ phrase }) => normalized.includes(phrase))?.phrase ?? null;
  }
}

export const forbiddenPhraseService = new ForbiddenPhraseService();
