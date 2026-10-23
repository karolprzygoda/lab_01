import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export function ForbiddenPhrasesSkeleton() {
  return (
    <div role="status" aria-label="Ładowanie zabronionych fraz" className="flex flex-wrap gap-2">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-7 w-24" />
      ))}
    </div>
  );
}

export function ProductsRowsSkeleton() {
  return Array.from({ length: 5 }, (_, row) => (
    <TableRow key={row} aria-label="Ładowanie produktu">
      <TableCell><Skeleton className="h-4 w-6" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
      <TableCell>
        <div className="flex gap-2">
          {Array.from({ length: 3 }, (_, action) => (
            <Skeleton key={action} className="h-7 w-16" />
          ))}
        </div>
      </TableCell>
    </TableRow>
  ));
}
