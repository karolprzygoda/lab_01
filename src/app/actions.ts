"use server";

import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors";
import { forbiddenPhraseService } from "@/services/forbidden-phrase.service";
import { productService } from "@/services/product.service";

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

function toActionError(error: unknown): ActionState {
  if (error instanceof AppError) {
    const fieldErrors: Record<string, string> = {};
    for (const detail of error.details ?? []) {
      if (!fieldErrors[detail.field]) {
        fieldErrors[detail.field] = detail.message;
      }
    }
    return {
      ok: false,
      message: error.message,
      fieldErrors,
    };
  }
  return { ok: false, message: "Wystąpił nieoczekiwany błąd serwera" };
}

export async function saveProductAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const idRaw = formData.get("id");
    const payload = {
      name: String(formData.get("name") ?? ""),
      category: String(formData.get("category") ?? ""),
      price: Number(formData.get("price")),
      quantity: Number(formData.get("quantity")),
    };

    if (idRaw) {
      await productService.update(Number(idRaw), payload);
    } else {
      await productService.create(payload);
    }

    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteProductAction(id: number): Promise<void> {
  await productService.delete(id);
  revalidatePath("/");
}

export async function createForbiddenPhraseAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await forbiddenPhraseService.create({
      phrase: String(formData.get("phrase") ?? ""),
    });
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteForbiddenPhraseAction(id: number): Promise<void> {
  await forbiddenPhraseService.delete(id);
  revalidatePath("/");
}
