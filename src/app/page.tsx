import { Suspense } from "react";
import { ForbiddenPhrasesCard } from "@/components/products/forbidden-phrases-card";
import { ProductFormCard } from "@/components/products/product-form-card";
import { ProductHistoryCard } from "@/components/products/product-history-card";
import { ProductsTableCard } from "@/components/products/products-table-card";
import { NOTICES } from "@/lib/action-state";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { validateId } from "@/lib/validation/id.schema";
import { forbiddenPhraseService } from "@/services/forbidden-phrase.service";
import { productService } from "@/services/product.service";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function selectionId(value: string | string[] | undefined, label: string) {
  if (value === undefined) return { id: null };
  try {
    return { id: validateId(value) };
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error;
    return { id: null, error: `Niepoprawny identyfikator ${label}.` };
  }
}

async function resolveView(searchParams: SearchParams) {
  const params = await searchParams;
  const edit = selectionId(params.edit, "edycji");
  const history = selectionId(params.history, "historii");
  const notice = typeof params.notice === "string" && Object.hasOwn(NOTICES, params.notice)
    ? NOTICES[params.notice as keyof typeof NOTICES]
    : null;

  let entries = null;
  let historyError = history.error;
  if (history.id !== null) {
    try {
      entries = await productService.getHistory(history.id);
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error;
      historyError = error.message;
    }
  }
  return { edit, history, entries, historyError, notice };
}

async function ProductsContent({ searchParams }: { searchParams: SearchParams }) {
  // History starts as soon as searchParams resolve, independently of the other reads.
  const [view, products, phrases] = await Promise.all([
    resolveView(searchParams), productService.list(), forbiddenPhraseService.list(),
  ]);
  const editingProduct = products.find(({ id }) => id === view.edit.id) ?? null;
  const editError = view.edit.error ?? (view.edit.id !== null && !editingProduct
    ? `Nie znaleziono produktu o id ${view.edit.id}.`
    : null);

  return (
    <div className="flex flex-col gap-6">
      {view.notice ? <p role="status">{view.notice}</p> : null}
      {editError ? <p role="alert">{editError}</p> : null}
      {view.historyError ? <p role="alert">{view.historyError}</p> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <ProductFormCard editingProduct={editingProduct} />
        <ForbiddenPhrasesCard phrases={phrases.map(({ id, phrase }) => ({ id, phrase }))} />
      </div>
      <ProductsTableCard products={products} />
      {view.history.id !== null && view.entries ? (
        <ProductHistoryCard productId={view.history.id} entries={view.entries} />
      ) : null}
    </div>
  );
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Zarządzanie produktami</h1>
        <p className="text-sm opacity-70">
          Dodawaj produkty, zarządzaj zabronionymi frazami i przeglądaj historię zmian.
        </p>
      </div>
      <Suspense fallback={<p role="status" className="text-sm">Ładowanie danych z bazy…</p>}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
