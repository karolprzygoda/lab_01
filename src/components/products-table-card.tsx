import { deleteProductAction } from "@/server/actions";
import { SubmitButton } from "@/components/submit-button";
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
import { productService } from "@/server/services/product.service";

export async function ProductsTableCard() {
  const products = await productService.list();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produkty ({products.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nazwa</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Cena</TableHead>
              <TableHead>Ilość</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{product.category}</Badge>
                </TableCell>
                <TableCell>{product.price.toFixed(2)} PLN</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <ActionLink href={`/?edit=${product.id}`}>
                    Edytuj
                  </ActionLink>
                  <ActionLink href={`/?history=${product.id}`}>
                    Historia
                  </ActionLink>
                  <form action={deleteProductAction.bind(null, product.id)}>
                    <SubmitButton size="sm" variant="destructive">
                      Usuń
                    </SubmitButton>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
