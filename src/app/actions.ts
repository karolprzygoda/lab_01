"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EMPTY_PRODUCT_VALUES, type ActionState, type PhraseFormValues, type ProductFormValues } from "@/lib/action-state";
import { AppError, NotFoundError } from "@/lib/errors";
import { validateId } from "@/lib/validation/id.schema";
import { forbiddenPhraseService } from "@/services/forbidden-phrase.service";
import { productService } from "@/services/product.service";

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function readNumber(value: string) {
  return value.trim() === "" ? undefined : Number(value);
}

function toActionError<T>(error: unknown, values: T, revision: number): ActionState<T> {
  if (error instanceof AppError) {
    const fieldErrors: Record<string, string> = {};
    for (const detail of error.details ?? []) {
      fieldErrors[detail.field] ??= detail.message;
    }
    return { ok: false, revision, message: error.message, fieldErrors, values };
  }
  console.error("Server Action failed", error);
  return { ok: false, revision, message: "Wystąpił nieoczekiwany błąd serwera. Spróbuj ponownie.", values };
}

export async function saveProductAction(
  prevState: ActionState<ProductFormValues>,
  formData: FormData,
): Promise<ActionState<ProductFormValues>> {
  const values: ProductFormValues = {
    name: readText(formData, "name"),
    category: readText(formData, "category"),
    price: readText(formData, "price"),
    quantity: readText(formData, "quantity"),
  };
  const revision = prevState.revision + 1;
  const isEditing = formData.has("id");
  try {
    const payload = { ...values, price: readNumber(values.price), quantity: readNumber(values.quantity) };
    if (isEditing) {
      await productService.update(validateId(formData.get("id")), payload);
    } else {
      await productService.create(payload);
    }
  } catch (error) {
    return toActionError(error, values, revision);
  }

  // Navigation is outside the catch: redirect uses a framework control-flow exception.
  revalidatePath("/");
  if (isEditing) redirect("/?notice=product-saved");
  return { ok: true, revision, message: "Produkt został dodany.", values: EMPTY_PRODUCT_VALUES };
}

export async function createForbiddenPhraseAction(
  prevState: ActionState<PhraseFormValues>,
  formData: FormData,
): Promise<ActionState<PhraseFormValues>> {
  const values = { phrase: readText(formData, "phrase") };
  const revision = prevState.revision + 1;
  try {
    await forbiddenPhraseService.create(values);
  } catch (error) {
    return toActionError(error, values, revision);
  }
  revalidatePath("/");
  return { ok: true, revision, message: "Fraza została dodana.", values: { phrase: "" } };
}

async function deleteResource(operation: () => Promise<void>, success: string): Promise<never> {
  let notice = success;
  try {
    await operation();
  } catch (error) {
    notice = error instanceof NotFoundError ? "delete-not-found" : "delete-failed";
    if (!(error instanceof AppError)) console.error("Delete action failed", error);
  }
  revalidatePath("/");
  redirect(`/?notice=${notice}`);
}

export async function deleteProductAction(id: number): Promise<never> {
  return deleteResource(() => productService.delete(validateId(id)), "product-deleted");
}

export async function deleteForbiddenPhraseAction(id: number): Promise<never> {
  return deleteResource(() => forbiddenPhraseService.delete(validateId(id)), "phrase-deleted");
}
