import { deleteForbiddenPhraseAction } from "@/server/actions";
import { forbiddenPhraseService } from "@/server/services/forbidden-phrase.service";
import { RemovePhraseBadge } from "@/components/remove-phrase-badge";

export async function ForbiddenPhrasesList() {
  const phrases = await forbiddenPhraseService.list();

  if (phrases.length === 0) return <p>Brak zdefiniowanych fraz.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {phrases.map(({ id, phrase }) => (
        <form key={id} action={deleteForbiddenPhraseAction.bind(null, id)}>
          <RemovePhraseBadge phrase={phrase} />
        </form>
      ))}
    </div>
  );
}
