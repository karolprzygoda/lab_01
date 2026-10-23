export type ActionState<T = Record<string, string>> = {
  ok: boolean;
  revision: number;
  message?: string;
  fieldErrors?: Record<string, string>;
  values: T;
};

export type ProductFormValues = { name: string; category: string; price: string; quantity: string };
export type PhraseFormValues = { phrase: string };

export const EMPTY_PRODUCT_VALUES: ProductFormValues = {
  name: "", category: "ELECTRONICS", price: "", quantity: "0",
};

export type Notification = {
  id: string;
  title: string;
  type: "success" | "error";
};

export const NOTICES = {
  "product-saved": { type: "success", title: "Zmiany produktu zostały zapisane." },
  "product-deleted": { type: "success", title: "Produkt został usunięty." },
  "phrase-deleted": { type: "success", title: "Fraza została usunięta." },
  "delete-not-found": { type: "error", title: "Nie można usunąć zasobu, ponieważ już nie istnieje." },
  "delete-failed": { type: "error", title: "Nie udało się usunąć zasobu. Spróbuj ponownie." },
} as const;
