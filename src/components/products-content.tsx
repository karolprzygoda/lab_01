import { ForbiddenPhrasesCard } from "@/components/forbidden-phrases-card";
import { ProductFormCard } from "@/components/product-form-card";
import { ProductHistoryCard } from "@/components/product-history-card";
import { ProductsTableCard } from "@/components/products-table-card";
import { getProductsView } from "@/server/products-view";

type ProductsContentProps = {
  searchParams: PageProps<"/">["searchParams"];
};

export async function ProductsContent({ searchParams }: ProductsContentProps) {
  const view = await getProductsView(searchParams);

  return (
    <div className="flex flex-col gap-6">
      {view.notice ? <p role="status">{view.notice}</p> : null}
      {view.editError ? <p role="alert">{view.editError}</p> : null}
      {view.historyError ? <p role="alert">{view.historyError}</p> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <ProductFormCard editingProduct={view.editingProduct} />
        <ForbiddenPhrasesCard phrases={view.phrases} />
      </div>
      <ProductsTableCard products={view.products} />
      {view.history ? (
        <ProductHistoryCard
          productId={view.history.productId}
          entries={view.history.entries}
        />
      ) : null}
    </div>
  );
}
