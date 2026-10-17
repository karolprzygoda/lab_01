import { ForbiddenPhrasesCard } from "@/components/products/forbidden-phrases-card";
import { ProductFormCard } from "@/components/products/product-form-card";
import { ProductHistoryCard } from "@/components/products/product-history-card";
import { ProductsTableCard } from "@/components/products/products-table-card";
import { forbiddenPhraseService } from "@/services/forbidden-phrase.service";
import { productService } from "@/services/product.service";
import { Suspense } from "react";

type SearchParams = Promise<{ edit?: string; history?: string }>;

async function ProductsContent({ searchParams }: { searchParams: SearchParams }) {
  const [{ edit, history }, products, phrases] = await Promise.all([
    searchParams,
    productService.list(),
    forbiddenPhraseService.list(),
  ]);

  const editId = edit ? Number(edit) : null;
  const editingProduct = editId ? (products.find((p) => p.id === editId) ?? null) : null;

  const historyId = history ? Number(history) : null;
  const historyEntries =
    historyId && Number.isSafeInteger(historyId) && historyId > 0
      ? await productService.getHistory(historyId).catch(() => null)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ProductFormCard editingProduct={editingProduct} />
        <ForbiddenPhrasesCard phrases={phrases.map(({ id, phrase }) => ({ id, phrase }))} />
      </div>

      <ProductsTableCard products={products} />

      {historyId && historyEntries && (
        <ProductHistoryCard productId={historyId} entries={historyEntries} />
      )}
    </div>
  );
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Zarządzanie Produktami — REST API</h1>
        <p className="text-sm text-zinc-500">
          Panel oparty o Server Components, Server Actions oraz komponenty shadcn/ui (endpointy REST
          API dostępne pod <code>/api/v1/products</code> i <code>/api/v1/forbidden-phrases</code>).
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-zinc-500">Ładowanie danych z bazy...</p>}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
