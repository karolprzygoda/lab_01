import type { Metadata } from "next";
import { ActionLink } from "@/components/action-link";

export const metadata: Metadata = {
  title: "404 — Nie znaleziono strony",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-start gap-4 p-6">
      <p className="text-sm opacity-70">404</p>
      <h1 className="text-2xl font-semibold">Nie znaleziono strony</h1>
      <p>Strona pod tym adresem nie istnieje.</p>
      <ActionLink href="/">Wróć do produktów</ActionLink>
    </main>
  );
}
