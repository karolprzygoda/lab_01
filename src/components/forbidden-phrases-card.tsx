import { Suspense } from "react";
import { ForbiddenPhraseForm } from "@/components/forbidden-phrase-form";
import { ForbiddenPhrasesList } from "@/components/forbidden-phrases-list";
import { ForbiddenPhrasesSkeleton } from "@/components/product-skeletons";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ForbiddenPhrasesCard() {
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
        <div className="h-32 overflow-y-auto [scrollbar-gutter:stable]">
          <Suspense fallback={<ForbiddenPhrasesSkeleton />}>
            <ForbiddenPhrasesList />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
}
