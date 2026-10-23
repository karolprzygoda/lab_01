import { Suspense } from "react";
import { ProductRows } from "@/components/product-rows";
import { ProductsRowsSkeleton } from "@/components/product-skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ProductsTableCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produkty</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 overflow-auto [scrollbar-gutter:stable]">
          <Table className="min-w-[48rem] table-fixed">
            <colgroup>
              <col className="w-12" />
              <col className="w-48" />
              <col className="w-36" />
              <col className="w-28" />
              <col className="w-20" />
              <col className="w-64" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nazwa</TableHead>
                <TableHead>Kategoria</TableHead>
                <TableHead>Cena</TableHead>
                <TableHead>Ilość</TableHead>
                <TableHead>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Suspense fallback={<ProductsRowsSkeleton />}>
                <ProductRows />
              </Suspense>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
