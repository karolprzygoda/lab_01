import { ProductForm } from "@/components/products/product-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductDto } from "@/services/mappers";

export function ProductFormCard({ editingProduct }: { editingProduct: ProductDto | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingProduct ? `Edytuj produkt #${editingProduct.id}` : "Dodaj produkt"}
        </CardTitle>
        <CardDescription>
          Nazwa 3–20 znaków alfanumerycznych, cena zależna od kategorii.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProductForm editingProduct={editingProduct} />
      </CardContent>
    </Card>
  );
}
