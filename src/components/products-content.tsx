import { Suspense } from "react";
import { ForbiddenPhrasesCard } from "@/components/forbidden-phrases-card";
import { ProductFormCard } from "@/components/product-form-card";
import { ProductHistoryCard } from "@/components/product-history-card";
import { ProductsTableCard } from "@/components/products-table-card";
import { ProductNotice } from "@/components/product-notice";
import {
  ForbiddenPhrasesSkeleton,
  ProductFormSkeleton,
  ProductsTableSkeleton,
} from "@/components/product-skeletons";

type ProductsContentProps = {
  searchParams: PageProps<"/">["searchParams"];
};

export function ProductsContent({ searchParams }: ProductsContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <ProductNotice searchParams={searchParams} />
      </Suspense>
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<ProductFormSkeleton />}>
          <ProductFormCard searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<ForbiddenPhrasesSkeleton />}>
          <ForbiddenPhrasesCard />
        </Suspense>
      </div>
      <Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsTableCard />
      </Suspense>
      <Suspense fallback={null}>
        <ProductHistoryCard searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
