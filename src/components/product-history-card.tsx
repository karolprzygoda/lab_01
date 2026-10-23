import { Badge } from "@/components/ui/badge";
import { ActionLink } from "@/components/action-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HistoryEntryDto } from "@/lib/product-types";

interface ProductHistoryCardProps {
  productId: number;
  entries: HistoryEntryDto[];
}

export function ProductHistoryCard({ productId, entries }: ProductHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
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
      </CardContent>
    </Card>
  );
}
