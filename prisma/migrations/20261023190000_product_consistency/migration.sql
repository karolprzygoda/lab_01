-- Do not silently remove existing duplicates: applying this migration fails if
-- conflicting names already exist and requires resolving those records first.
CREATE UNIQUE INDEX "Product_name_insensitive_key" ON "Product" (lower("name"));

DROP INDEX "ProductHistory_productId_createdAt_idx";
CREATE INDEX "ProductHistory_productId_id_idx" ON "ProductHistory"("productId", "id");
