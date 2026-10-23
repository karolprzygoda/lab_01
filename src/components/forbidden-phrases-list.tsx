import { deleteForbiddenPhraseAction } from "@/server/actions";
import { forbiddenPhraseService } from "@/server/services/forbidden-phrase.service";
import { RemovePhraseBadge } from "@/components/remove-phrase-badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ShieldBanIcon } from "lucide-react";

export async function ForbiddenPhrasesList() {
  const phrases = await forbiddenPhraseService.list();

  if (phrases.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><ShieldBanIcon aria-hidden="true" /></EmptyMedia>
          <EmptyTitle>Brak zabronionych fraz</EmptyTitle>
          <EmptyDescription>Dodaj pierwszą frazę za pomocą formularza powyżej.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

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
