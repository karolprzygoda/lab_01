import { ProductsContent } from "@/components/products-content";
import { getEditingProduct, getProductSelection, getSelectedHistory } from "@/server/products-view";

export default async function Home({ searchParams }: PageProps<"/">) {
  const [selection, editing, selectedHistory] = await Promise.all([
    getProductSelection(searchParams),
    getEditingProduct(searchParams),
    getSelectedHistory(searchParams),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Zarządzanie produktami</h1>
        <p className="text-muted-foreground">
          Dodawaj produkty, zarządzaj zabronionymi frazami i przeglądaj historię zmian.
        </p>
      </div>
      <ProductsContent
        editingProduct={editing.product}
        editError={editing.error}
        history={selectedHistory.history}
        historyError={selectedHistory.error}
        notice={selection.notice}
      />
    </main>
  );
}
