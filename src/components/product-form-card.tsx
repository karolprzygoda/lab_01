import { ProductForm } from "@/components/product-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductDto } from "@/lib/product-types";
import { EMPTY_PRODUCT_VALUES } from "@/lib/action-state";
import { ActionLink } from "@/components/action-link";
import { SubmitButton } from "@/components/submit-button";
import { CATEGORY_NAMES, PRICE_RANGES } from "@/lib/product-rules";
import type { Category } from "@generated/enums";

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
        <ProductForm
          key={editingProduct?.id ?? "new"}
          productId={editingProduct?.id}
          categoryOptions={Object.entries(CATEGORY_NAMES).map(([category, label]) => (
            <option key={category} value={category}>
              {label} ({PRICE_RANGES[category as Category].min}–{PRICE_RANGES[category as Category].max} PLN)
            </option>
          ))}
          initialValues={editingProduct ? {
            name: editingProduct.name,
            category: editingProduct.category,
            price: String(editingProduct.price),
            quantity: String(editingProduct.quantity),
          } : EMPTY_PRODUCT_VALUES}
        >
          <SubmitButton>{editingProduct ? "Zapisz zmiany" : "Utwórz"}</SubmitButton>
          {editingProduct ? <ActionLink href="/">Anuluj</ActionLink> : null}
        </ProductForm>
      </CardContent>
    </Card>
  );
}
