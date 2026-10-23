import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ProductFormSkeleton() {
  return (
    <Card role="status" aria-label="Ładowanie formularza produktu" aria-busy="true">
      <CardHeader aria-hidden="true">
        <Skeleton className="h-6 w-40 motion-reduce:animate-none" />
        <Skeleton className="h-4 w-full motion-reduce:animate-none" />
      </CardHeader>
      <CardContent aria-hidden="true" className="flex flex-col gap-5">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20 motion-reduce:animate-none" />
            <Skeleton className="h-8 w-full motion-reduce:animate-none" />
            <Skeleton className="h-3 w-3/4 motion-reduce:animate-none" />
          </div>
        ))}
        <Skeleton className="h-9 w-24 motion-reduce:animate-none" />
      </CardContent>
    </Card>
  );
}

export function ForbiddenPhrasesSkeleton() {
  return (
    <Card role="status" aria-label="Ładowanie zabronionych fraz" aria-busy="true">
      <CardHeader>
        <CardTitle>Zabronione frazy</CardTitle>
      </CardHeader>
      <CardContent aria-hidden="true" className="flex flex-col gap-4">
        <Skeleton className="h-4 w-full motion-reduce:animate-none" />
        <Skeleton className="h-8 w-full motion-reduce:animate-none" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 motion-reduce:animate-none" />
          <Skeleton className="h-6 w-24 motion-reduce:animate-none" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductsTableSkeleton() {
  return (
    <Card role="status" aria-label="Ładowanie produktów" aria-busy="true">
      <CardHeader>
        <CardTitle>Produkty</CardTitle>
      </CardHeader>
      <CardContent aria-hidden="true">
        <Table>
          <TableHeader>
            <TableRow>
              {["ID", "Nazwa", "Kategoria", "Cena", "Ilość", "Akcje"].map((label) => (
                <TableHead key={label}>{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }, (_, row) => (
              <TableRow key={row}>
                <TableCell><Skeleton className="h-4 w-6 motion-reduce:animate-none" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28 motion-reduce:animate-none" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24 motion-reduce:animate-none" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20 motion-reduce:animate-none" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8 motion-reduce:animate-none" /></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {Array.from({ length: 3 }, (_, action) => (
                      <Skeleton key={action} className="h-8 w-16 motion-reduce:animate-none" />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
