import { ProductsContent } from "@/components/products-content";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Zarządzanie produktami</h1>
        <p className="text-sm opacity-70">
          Dodawaj produkty, zarządzaj zabronionymi frazami i przeglądaj historię zmian.
        </p>
      </div>
      <ProductsContent searchParams={searchParams} />
    </main>
  );
}
