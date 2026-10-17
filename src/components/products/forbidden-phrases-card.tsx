import { deleteForbiddenPhraseAction } from "@/app/actions";
import { ForbiddenPhraseForm } from "@/components/products/forbidden-phrase-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type ForbiddenPhraseItem = {
  id: number;
  phrase: string;
};

export function ForbiddenPhrasesCard({ phrases }: { phrases: ForbiddenPhraseItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zabronione frazy</CardTitle>
        <CardDescription>
          Blokują dodawanie i edycję produktów zawierających frazę w nazwie.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ForbiddenPhraseForm />

        <div className="flex flex-wrap gap-2">
          {phrases.length === 0 ? (
            <span className="text-xs text-zinc-500">Brak zdefiniowanych fraz.</span>
          ) : (
            phrases.map((p) => (
              <Badge key={p.id} variant="secondary" className="gap-1.5">
                {p.phrase}
                <form action={deleteForbiddenPhraseAction.bind(null, p.id)} className="inline">
                  <button
                    type="submit"
                    className="text-zinc-500 hover:text-red-600"
                    aria-label={`Usuń ${p.phrase}`}
                  >
                    ×
                  </button>
                </form>
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
