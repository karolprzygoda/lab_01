"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveProductAction, type ActionState } from "@/app/actions";
import { SubmitButton } from "@/components/products/submit-button";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Category } from "@/generated/prisma/enums";
import type { ProductDto } from "@/services/mappers";

const CATEGORY_LABELS: Record<Category, string> = {
  ELECTRONICS: "Elektronika (50–50 000 PLN)",
  BOOKS: "Książki (5–500 PLN)",
  CLOTHING: "Odzież (10–5 000 PLN)",
};

const initialState: ActionState = { ok: false };

export function ProductForm({ editingProduct }: { editingProduct: ProductDto | null }) {
  const [formKey, setFormKey] = useState(0);
  const router = useRouter();

  const [state, formAction] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await saveProductAction(prev, formData);
      if (result.ok) {
        setFormKey((k) => k + 1);
        if (editingProduct) {
          router.push("/");
        }
      }
      return result;
    },
    initialState,
  );

  return (
    <Form
      key={`${editingProduct?.id ?? "new"}-${formKey}`}
      action={formAction}
      errors={state.fieldErrors}
    >
      {editingProduct && <input type="hidden" name="id" value={editingProduct.id} />}

      {state.message && !state.fieldErrors && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">{state.message}</p>
      )}

      <FormField name="name">
        <FormItem>
          <FormLabel>Nazwa</FormLabel>
          <FormControl>
            <Input
              name="name"
              defaultValue={editingProduct?.name ?? ""}
              placeholder="np. Laptop123"
              required
            />
          </FormControl>
          <FormDescription>Wyłącznie litery i cyfry, unikalna nazwa.</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField name="category">
        <FormItem>
          <FormLabel>Kategoria</FormLabel>
          <FormControl>
            <Select name="category" defaultValue={editingProduct?.category ?? "ELECTRONICS"}>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField name="price">
          <FormItem>
            <FormLabel>Cena (PLN)</FormLabel>
            <FormControl>
              <Input
                name="price"
                type="number"
                step="0.01"
                defaultValue={editingProduct ? String(editingProduct.price) : ""}
                required
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="quantity">
          <FormItem>
            <FormLabel>Ilość</FormLabel>
            <FormControl>
              <Input
                name="quantity"
                type="number"
                defaultValue={editingProduct ? String(editingProduct.quantity) : "0"}
                required
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <div className="flex gap-2 pt-1">
        <SubmitButton>{editingProduct ? "Zapisz zmiany" : "Utwórz"}</SubmitButton>
        {editingProduct && (
          <Link href="/">
            <Button type="button" variant="outline">
              Anuluj
            </Button>
          </Link>
        )}
      </div>
    </Form>
  );
}
