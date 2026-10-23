import { ForbiddenPhrasesCard } from "@/components/forbidden-phrases-card";
import { ProductFormCard } from "@/components/product-form-card";
import { ProductHistoryCard } from "@/components/product-history-card";
import { ProductsTableCard } from "@/components/products-table-card";
import type { HistoryEntryDto, ProductDto } from "@/lib/product-types";

type ProductsContentProps = {
  editingProduct: ProductDto | null;
  editError: string | null;
  history: { productId: number; entries: HistoryEntryDto[] } | null;
  historyError: string | null;
  notice: string | null;
};

export function ProductsContent({
  editingProduct, editError, history, historyError, notice,
}: ProductsContentProps) {
  return (
    <div className="flex flex-col gap-6">
      {notice ? <p role="status">{notice}</p> : null}
      <div className="grid items-start gap-6 md:grid-cols-2">
        <ProductFormCard editingProduct={editingProduct} error={editError} />
        <ForbiddenPhrasesCard />
      </div>
      <ProductsTableCard />
      {historyError ? <p role="alert">{historyError}</p> : null}
      {history ? <ProductHistoryCard {...history} /> : null}
    </div>
  );
}
