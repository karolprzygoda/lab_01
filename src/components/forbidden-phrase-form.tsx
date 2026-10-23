"use client";

import { useActionState, useId, type ReactNode } from "react";
import { createForbiddenPhraseAction } from "@/server/actions";
import type { ActionState, PhraseFormValues } from "@/lib/action-state";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: ActionState<PhraseFormValues> = { ok: false, revision: 0, values: { phrase: "" } };

export function ForbiddenPhraseForm({ children }: { children: ReactNode }) {
  const id = useId();
  const [state, formAction] = useActionState(createForbiddenPhraseAction, initialState);
  const error = state.fieldErrors?.phrase;

  return (
    <form key={state.revision} action={formAction}>
      <FieldGroup>
        {state.message ? <p role={state.ok ? "status" : "alert"}>{state.message}</p> : null}
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor={id}>Nowa zabroniona fraza</FieldLabel>
          <div className="flex gap-2">
            <Input
              id={id}
              name="phrase"
              defaultValue={state.values.phrase}
              placeholder="Dodaj zabronioną frazę..."
              aria-invalid={Boolean(error)}
              aria-describedby={`${id}-description${error ? ` ${id}-error` : ""}`}
              required
            />
            {children}
          </div>
          <FieldDescription id={`${id}-description`}>Od 1 do 50 znaków, bez rozróżniania wielkości liter.</FieldDescription>
          <FieldError id={`${id}-error`}>{error}</FieldError>
        </Field>
      </FieldGroup>
    </form>
  );
}
