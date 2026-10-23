import type { Category } from "@/generated/prisma/enums";
import { prisma, type DbClient } from "@/lib/prisma";

export type ProductData = {
  name: string;
  category: Category;
  price: number;
  quantity: number;
};

export class ProductRepository {
  findAll(db: DbClient = prisma) {
    return db.product.findMany({ orderBy: { id: "asc" } });
  }

  findById(id: number, db: DbClient = prisma) {
    return db.product.findUnique({ where: { id } });
  }

  async findByIdForUpdate(id: number, db: DbClient) {
    // The caller must keep the read, mutation and history write in one transaction.
    await db.$queryRaw`SELECT "id" FROM "Product" WHERE "id" = ${id} FOR UPDATE`;
    return this.findById(id, db);
  }

  findByNameInsensitive(name: string, db: DbClient = prisma) {
    return db.product.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  }

  create(data: ProductData, db: DbClient = prisma) {
    return db.product.create({ data });
  }

  update(id: number, data: ProductData, db: DbClient = prisma) {
    return db.product.update({ where: { id }, data });
  }

  delete(id: number, db: DbClient = prisma) {
    return db.product.delete({ where: { id } });
  }
}

export const productRepository = new ProductRepository();
