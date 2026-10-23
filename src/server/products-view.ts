import "server-only";

import { NOTICES } from "@/lib/action-state";
import { NotFoundError, ValidationError } from "@/server/errors";
import { forbiddenPhraseService } from "@/server/services/forbidden-phrase.service";
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

async function resolveRequestedView(searchParams: SearchParams) {
  const params = await searchParams;
  const edit = parseSelectionId(params.edit, "edycji");
  const history = parseSelectionId(params.history, "historii");
  const notice =
    typeof params.notice === "string" && Object.hasOwn(NOTICES, params.notice)
      ? NOTICES[params.notice as keyof typeof NOTICES]
      : null;

  let selectedHistory = null;
  let historyError = history.error;

  if (history.id !== null) {
    try {
      selectedHistory = {
        productId: history.id,
        entries: await productService.getHistory(history.id),
      };
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error;
      historyError = error.message;
    }
  }

  return { edit, selectedHistory, historyError, notice };
}

export async function getProductsView(searchParams: SearchParams) {
  const [view, products, phrases] = await Promise.all([
    resolveRequestedView(searchParams),
    productService.list(),
    forbiddenPhraseService.list(),
  ]);

  const editingProduct = products.find(({ id }) => id === view.edit.id) ?? null;
  const editError =
    view.edit.error ??
    (view.edit.id !== null && !editingProduct
      ? `Nie znaleziono produktu o id ${view.edit.id}.`
      : null);

  return {
    products,
    phrases,
    editingProduct,
    editError,
    history: view.selectedHistory,
    historyError: view.historyError,
    notice: view.notice,
  };
}
