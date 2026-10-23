import "server-only";

import { cache } from "react";
import { NOTICES } from "@/lib/action-state";
import { NotFoundError, ValidationError } from "@/server/errors";
import { productService } from "@/server/services/product.service";
import { validateId } from "@/server/validation/id.schema";

type SearchParams = PageProps<"/">["searchParams"];

function parseSelectionId(value: string | string[] | undefined, label: string) {
  if (value === undefined) return { id: null, error: null };

  try {
    return { id: validateId(value), error: null };
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error;
    return { id: null, error: `Niepoprawny identyfikator ${label}.` };
  }
}

export const getProductSelection = cache(async (searchParams: SearchParams) => {
  const params = await searchParams;
  const edit = parseSelectionId(params.edit, "edycji");
  const history = parseSelectionId(params.history, "historii");
  const noticeKey =
    typeof params.notice === "string" && Object.hasOwn(NOTICES, params.notice)
      ? params.notice as keyof typeof NOTICES
      : null;
  const notice = noticeKey ? {
    ...NOTICES[noticeKey],
    id: typeof params.noticeId === "string" ? params.noticeId : noticeKey,
  } : null;

  return { edit, history, notice };
});

export async function getEditingProduct(searchParams: SearchParams) {
  const { edit } = await getProductSelection(searchParams);
  if (edit.id === null) return { product: null, error: edit.error };

  try {
    return { product: await productService.get(edit.id), error: null };
  } catch (error) {
    if (!(error instanceof NotFoundError)) throw error;
    return { product: null, error: `Nie znaleziono produktu o id ${edit.id}.` };
  }
}

export async function getSelectedHistory(searchParams: SearchParams) {
  const { history } = await getProductSelection(searchParams);
  if (history.id === null) return { history: null, error: history.error };

  try {
    return {
      history: { productId: history.id, entries: await productService.getHistory(history.id) },
      error: null,
    };
  } catch (error) {
    if (!(error instanceof NotFoundError)) throw error;
    return { history: null, error: error.message };
  }
}
