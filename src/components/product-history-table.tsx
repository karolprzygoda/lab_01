import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HistoryEntryDto } from "@/lib/product-types";

interface ProductHistoryTableProps {
  entries: HistoryEntryDto[];
}

export function ProductHistoryTable({ entries }: ProductHistoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Operacja</TableHead>
          <TableHead>Poprzednia wartość</TableHead>
          <TableHead>Nowa wartość</TableHead>
          <TableHead>Czas</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>
              <Badge>{entry.action}</Badge>
            </TableCell>
            <TableCell>
              {entry.oldValue ? JSON.stringify(entry.oldValue) : "—"}
            </TableCell>
            <TableCell>
              {entry.newValue ? JSON.stringify(entry.newValue) : "—"}
            </TableCell>
            <TableCell>
              {new Date(entry.createdAt).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
