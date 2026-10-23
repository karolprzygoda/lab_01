import { deleteForbiddenPhraseAction } from "@/server/actions";
import { ForbiddenPhraseForm } from "@/components/forbidden-phrase-form";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forbiddenPhraseService } from "@/server/services/forbidden-phrase.service";

export async function ForbiddenPhrasesCard() {
  const phrases = await forbiddenPhraseService.list();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zabronione frazy</CardTitle>
        <CardDescription>
          Blokują dodawanie i edycję produktów zawierających frazę w nazwie.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ForbiddenPhraseForm><SubmitButton>Dodaj</SubmitButton></ForbiddenPhraseForm>

        <div className="flex flex-wrap gap-2">
          {phrases.length === 0 ? (
            <span className="text-xs text-zinc-500">Brak zdefiniowanych fraz.</span>
          ) : (
            phrases.map((p) => (
              <Badge key={p.id} variant="secondary" className="gap-1.5">
                {p.phrase}
                <form action={deleteForbiddenPhraseAction.bind(null, p.id)} className="inline">
                  <SubmitButton
                    size="sm"
                    variant="ghost"
                    aria-label={`Usuń ${p.phrase}`}
                  >
                    ×
                  </SubmitButton>
                </form>
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
