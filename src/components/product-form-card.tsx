import { ProductForm } from "@/components/product-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEditingProduct } from "@/server/products-view";
import { EMPTY_PRODUCT_VALUES } from "@/lib/action-state";
import { ActionLink } from "@/components/action-link";
import { SubmitButton } from "@/components/submit-button";
import { CATEGORY_NAMES, PRICE_RANGES } from "@/lib/product-rules";
import type { Category } from "@generated/enums";

export async function ProductFormCard({ searchParams }: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const { product: editingProduct, error } = await getEditingProduct(searchParams);

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
        {error ? <p role="alert" className="mb-4 text-sm">{error}</p> : null}
        <ProductForm
          key={editingProduct?.id ?? "new"}
          productId={editingProduct?.id}
          categoryOptions={Object.entries(CATEGORY_NAMES).map(([category, label]) => ({
            value: category,
            label: `${label} (${PRICE_RANGES[category as Category].min}–${PRICE_RANGES[category as Category].max} PLN)`,
          }))}
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
