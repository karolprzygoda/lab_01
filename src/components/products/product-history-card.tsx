import { Badge } from "@/components/ui/badge";
import { ActionLink } from "@/components/products/action-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HistoryEntryDto } from "@/services/mappers";

interface ProductHistoryCardProps {
  productId: number;
  entries: HistoryEntryDto[];
}

export function ProductHistoryCard({ productId, entries }: ProductHistoryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historia zmian produktu #{productId}</CardTitle>
        <ActionLink href="/">
          Zamknij
        </ActionLink>
      </CardHeader>
      <CardContent>
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
                <TableCell className="font-mono text-xs">
                  {entry.oldValue ? JSON.stringify(entry.oldValue) : "—"}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {entry.newValue ? JSON.stringify(entry.newValue) : "—"}
                </TableCell>
                <TableCell className="text-xs text-zinc-500">
                  {new Date(entry.createdAt).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
