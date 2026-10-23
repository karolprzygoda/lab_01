"use client";

import { useActionState, useId, type ReactNode } from "react";
import { saveProductAction } from "@/server/actions";
import type { ActionState, ProductFormValues } from "@/lib/action-state";
import { MAX_DATABASE_INT } from "@/lib/product-rules";
import { withActionToast } from "@/lib/action-toast";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

function saveProductWithToast(previous: ActionState<ProductFormValues>, data: FormData) {
  return withActionToast(saveProductAction(previous, data));
}

export function ProductForm({ productId, initialValues, categoryOptions, children }: {
  productId?: number;
  initialValues: ProductFormValues;
  categoryOptions: { value: string; label: string }[];
  children: ReactNode;
}) {
  const formId = useId();
  const initialState: ActionState<ProductFormValues> = { ok: false, revision: 0, values: initialValues };
  const [state, formAction] = useActionState(saveProductWithToast, initialState);
  const { values, fieldErrors = {} } = state;

  return (
    <form key={state.revision} action={formAction} className="flex flex-col gap-5">
      {productId !== undefined ? <input type="hidden" name="id" value={productId} /> : null}
      <FieldGroup>
        <Field data-invalid={Boolean(fieldErrors.name)}>
          <FieldLabel htmlFor={`${formId}-name`}>Nazwa</FieldLabel>
          <Input
            id={`${formId}-name`}
            name="name"
            defaultValue={values.name}
            placeholder="np. Laptop123"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={`${formId}-name-description${fieldErrors.name ? ` ${formId}-name-error` : ""}`}
            required
          />
          <FieldDescription id={`${formId}-name-description`}>Wyłącznie litery i cyfry, unikalna nazwa.</FieldDescription>
          <FieldError id={`${formId}-name-error`}>{fieldErrors.name}</FieldError>
        </Field>
        <Field data-invalid={Boolean(fieldErrors.category)}>
          <FieldLabel htmlFor={`${formId}-category`}>Kategoria</FieldLabel>
          <Select name="category" defaultValue={values.category} items={categoryOptions} required>
            <SelectTrigger
              id={`${formId}-category`}
              className="w-full"
              aria-invalid={Boolean(fieldErrors.category)}
              aria-describedby={`${formId}-category-description${fieldErrors.category ? ` ${formId}-category-error` : ""}`}
            >
              <SelectValue placeholder="Wybierz kategorię" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {categoryOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription id={`${formId}-category-description`}>Wybierz kategorię określającą dopuszczalny zakres cen.</FieldDescription>
          <FieldError id={`${formId}-category-error`}>{fieldErrors.category}</FieldError>
        </Field>
        <FieldGroup className="grid sm:grid-cols-2">
          <Field data-invalid={Boolean(fieldErrors.price)}>
            <FieldLabel htmlFor={`${formId}-price`}>Cena (PLN)</FieldLabel>
            <Input
              id={`${formId}-price`}
              name="price"
              type="number"
              step={0.01}
              min={0}
              defaultValue={values.price}
              aria-invalid={Boolean(fieldErrors.price)}
              aria-describedby={`${formId}-price-description${fieldErrors.price ? ` ${formId}-price-error` : ""}`}
              required
            />
            <FieldDescription id={`${formId}-price-description`}>Cena w PLN, maksymalnie dwa miejsca po przecinku.</FieldDescription>
            <FieldError id={`${formId}-price-error`}>{fieldErrors.price}</FieldError>
          </Field>
          <Field data-invalid={Boolean(fieldErrors.quantity)}>
            <FieldLabel htmlFor={`${formId}-quantity`}>Ilość</FieldLabel>
            <Input
              id={`${formId}-quantity`}
              name="quantity"
              type="number"
              step={1}
              min={0}
              max={MAX_DATABASE_INT}
              defaultValue={values.quantity}
              aria-invalid={Boolean(fieldErrors.quantity)}
              aria-describedby={`${formId}-quantity-description${fieldErrors.quantity ? ` ${formId}-quantity-error` : ""}`}
              required
            />
            <FieldDescription id={`${formId}-quantity-description`}>Liczba całkowita od 0 do {MAX_DATABASE_INT}.</FieldDescription>
            <FieldError id={`${formId}-quantity-error`}>{fieldErrors.quantity}</FieldError>
          </Field>
        </FieldGroup>
        <Separator />
        <Field orientation="horizontal">{children}</Field>
      </FieldGroup>
    </form>
  );
}
