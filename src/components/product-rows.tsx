import { deleteProductAction } from "@/server/actions";
import { productService } from "@/server/services/product.service";
import { ActionLink } from "@/components/action-link";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { PackageOpenIcon } from "lucide-react";

export async function ProductRows() {
  const products = await productService.list();

  if (products.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={6}>
          <div className="max-w-[calc(100vw-6rem)] md:max-w-none">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><PackageOpenIcon aria-hidden="true" /></EmptyMedia>
                <EmptyTitle>Brak produktów</EmptyTitle>
                <EmptyDescription>Dodaj pierwszy produkt za pomocą formularza powyżej.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return products.map((product) => (
    <TableRow key={product.id}>
      <TableCell>{product.id}</TableCell>
      <TableCell>{product.name}</TableCell>
      <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
      <TableCell>{product.price.toFixed(2)} PLN</TableCell>
      <TableCell>{product.quantity}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ActionLink href={`/?edit=${product.id}`}>Edytuj</ActionLink>
          <ActionLink href={`/?history=${product.id}`}>Historia</ActionLink>
          <form action={deleteProductAction.bind(null, product.id)}>
            <SubmitButton size="sm" variant="destructive">Usuń</SubmitButton>
          </form>
        </div>
      </TableCell>
    </TableRow>
  ));
}
