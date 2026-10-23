import { Suspense } from "react";
import { ForbiddenPhraseForm } from "@/components/forbidden-phrase-form";
import { ForbiddenPhrasesList } from "@/components/forbidden-phrases-list";
import { ForbiddenPhrasesSkeleton } from "@/components/product-skeletons";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ForbiddenPhrasesCard() {
  return (
    <Card className="min-h-0 md:[contain:size]">
      <CardHeader>
        <CardTitle>Zabronione frazy</CardTitle>
        <CardDescription>
          Blokują dodawanie i edycję produktów zawierających frazę w nazwie.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <ForbiddenPhraseForm><SubmitButton>Dodaj</SubmitButton></ForbiddenPhraseForm>
        <ScrollArea className="h-48 md:h-0 md:min-h-0 md:flex-1">
          <div className="p-1 pr-4">
            <Suspense fallback={<ForbiddenPhrasesSkeleton />}>
              <ForbiddenPhrasesList />
            </Suspense>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
