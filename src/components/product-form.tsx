"use client";

import { useActionState, type ReactNode } from "react";
import { saveProductAction } from "@/server/actions";
import type { ActionState, ProductFormValues } from "@/lib/action-state";
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
import { MAX_DATABASE_INT } from "@/lib/product-rules";

export function ProductForm({ productId, initialValues, categoryOptions, children }: {
  productId?: number;
  initialValues: ProductFormValues;
  categoryOptions: ReactNode;
  children: ReactNode;
}) {
  const initialState: ActionState<ProductFormValues> = { ok: false, revision: 0, values: initialValues };
  const [state, formAction] = useActionState(saveProductAction, initialState);
  const { values } = state;

  return (
    <Form
      key={state.revision}
      action={formAction}
      errors={state.fieldErrors}
    >
      {productId !== undefined ? <input type="hidden" name="id" value={productId} /> : null}

      {state.message ? <p role={state.ok ? "status" : "alert"} className="text-sm">{state.message}</p> : null}

      <FormField name="name">
        <FormItem>
          <FormLabel>Nazwa</FormLabel>
          <FormControl>
            <Input
              name="name"
              defaultValue={values.name}
              placeholder="np. Laptop123"
              required
            />
          </FormControl>
          <FormDescription>Wyłącznie litery i cyfry, unikalna nazwa.</FormDescription>
          <FormMessage aria-live="polite" />
        </FormItem>
      </FormField>

      <FormField name="category">
        <FormItem>
          <FormLabel>Kategoria</FormLabel>
          <FormControl>
            <Select name="category" defaultValue={values.category}>
              {categoryOptions}
            </Select>
          </FormControl>
          <FormDescription>Wybierz kategorię określającą dopuszczalny zakres cen.</FormDescription>
          <FormMessage aria-live="polite" />
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
                defaultValue={values.price}
                required
              />
            </FormControl>
            <FormDescription>Cena w PLN, maksymalnie dwa miejsca po przecinku.</FormDescription>
            <FormMessage aria-live="polite" />
          </FormItem>
        </FormField>

        <FormField name="quantity">
          <FormItem>
            <FormLabel>Ilość</FormLabel>
            <FormControl>
              <Input
                name="quantity"
                type="number"
                defaultValue={values.quantity}
                required
              />
            </FormControl>
            <FormDescription>Liczba całkowita od 0 do {MAX_DATABASE_INT}.</FormDescription>
            <FormMessage aria-live="polite" />
          </FormItem>
        </FormField>
      </div>

      <div className="flex gap-2 pt-1">
        {children}
      </div>
    </Form>
  );
}
