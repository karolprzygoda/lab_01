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

export const NOTICES = {
  "product-saved": "Zmiany produktu zostały zapisane.",
  "product-deleted": "Produkt został usunięty.",
  "phrase-deleted": "Fraza została usunięta.",
  "delete-not-found": "Nie można usunąć zasobu, ponieważ już nie istnieje.",
  "delete-failed": "Nie udało się usunąć zasobu. Spróbuj ponownie.",
} as const;
