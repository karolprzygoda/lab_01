import { deleteForbiddenPhraseAction } from "@/server/actions";
import { forbiddenPhraseService } from "@/server/services/forbidden-phrase.service";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";

export async function ForbiddenPhrasesList() {
  const phrases = await forbiddenPhraseService.list();

  if (phrases.length === 0) return <p>Brak zdefiniowanych fraz.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {phrases.map(({ id, phrase }) => (
        <div key={id} className="flex items-center gap-2">
          <Badge variant="secondary">{phrase}</Badge>
          <form action={deleteForbiddenPhraseAction.bind(null, id)}>
            <SubmitButton size="icon-xs" variant="ghost" aria-label={`Usuń ${phrase}`}>
              ×
            </SubmitButton>
          </form>
        </div>
      ))}
    </div>
  );
}
