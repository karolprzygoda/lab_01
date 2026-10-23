"use client";

import { Button } from "@/components/ui/button";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-start gap-4 p-6" role="alert">
      <h1 className="text-xl font-semibold">Nie udało się wczytać danych</h1>
      <p>Wystąpił błąd serwera. Spróbuj ponownie za chwilę.</p>
      <Button onClick={() => retry()}>Spróbuj ponownie</Button>
    </main>
  );
}
