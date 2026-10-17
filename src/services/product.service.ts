import type { Product } from "@/generated/prisma/client";
import { HistoryAction } from "@/generated/prisma/enums";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { prisma, type DbClient } from "@/lib/prisma";
import { validateProductInput, type ProductInput } from "@/lib/validation/product.schema";
import { historyRepository, type HistoryRepository } from "@/repositories/history.repository";
import { productRepository, type ProductRepository } from "@/repositories/product.repository";
import { forbiddenPhraseService, type ForbiddenPhraseService } from "@/services/forbidden-phrase.service";
import { toHistoryEntryDto, toProductDto } from "@/services/mappers";

function snapshot(product: Product) {
  return {
    name: product.name,
    category: product.category,
    price: product.price.toNumber(),
    quantity: product.quantity,
  };
}

export class ProductService {
  constructor(
    private readonly products: ProductRepository = productRepository,
    private readonly history: HistoryRepository = historyRepository,
    private readonly forbiddenPhrases: ForbiddenPhraseService = forbiddenPhraseService,
    private readonly db = prisma,
  ) {}

  async list() {
    const products = await this.products.findAll();
    return products.map(toProductDto);
  }

  async get(id: number) {
    return toProductDto(await this.findOrThrow(id));
  }

  async create(input: unknown) {
    const data = validateProductInput(input);
    return this.db.$transaction(async (tx) => {
      await this.assertNameAvailable(data, tx);
      const product = await this.products.create(data, tx);
      await this.history.create(
        { productId: product.id, action: HistoryAction.CREATE, oldValue: null, newValue: snapshot(product) },
        tx,
      );
      return toProductDto(product);
    });
  }

  async update(id: number, input: unknown) {
    const data = validateProductInput(input);
    return this.db.$transaction(async (tx) => {
      const existing = await this.findOrThrow(id, tx);
      await this.assertNameAvailable(data, tx, id);
      const product = await this.products.update(id, data, tx);
      await this.history.create(
        { productId: id, action: HistoryAction.UPDATE, oldValue: snapshot(existing), newValue: snapshot(product) },
        tx,
      );
      return toProductDto(product);
    });
  }

  async delete(id: number) {
    await this.db.$transaction(async (tx) => {
      const existing = await this.findOrThrow(id, tx);
      await this.products.delete(id, tx);
      await this.history.create(
        { productId: id, action: HistoryAction.DELETE, oldValue: snapshot(existing), newValue: null },
        tx,
      );
    });
  }

  async getHistory(id: number) {
    const entries = await this.history.findByProductId(id);
    if (entries.length === 0) {
      await this.findOrThrow(id);
    }
    return entries.map(toHistoryEntryDto);
  }

  private async findOrThrow(id: number, db: DbClient = prisma) {
    const product = await this.products.findById(id, db);
    if (!product) {
      throw new NotFoundError(`Nie znaleziono produktu o id ${id}`);
    }
    return product;
  }

  private async assertNameAvailable({ name }: ProductInput, db: DbClient, excludeId?: number) {
    const phrase = await this.forbiddenPhrases.findContainedIn(name, db);
    if (phrase) {
      throw new ValidationError([
        { field: "name", message: `Nazwa zawiera zabronioną frazę "${phrase}"` },
      ]);
    }
    const duplicate = await this.products.findByNameInsensitive(name, db);
    if (duplicate && duplicate.id !== excludeId) {
      throw new ConflictError(`Produkt o nazwie "${name}" już istnieje`, [
        { field: "name", message: "Nazwa produktu musi być unikalna" },
      ]);
    }
  }
}

export const productService = new ProductService();
