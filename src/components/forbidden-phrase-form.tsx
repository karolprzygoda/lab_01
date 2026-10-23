"use client";

import { useActionState, type ReactNode } from "react";
import { createForbiddenPhraseAction } from "@/server/actions";
import type { ActionState, PhraseFormValues } from "@/lib/action-state";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const initialState: ActionState<PhraseFormValues> = { ok: false, revision: 0, values: { phrase: "" } };

export function ForbiddenPhraseForm({ children }: { children: ReactNode }) {
  const [state, formAction] = useActionState(createForbiddenPhraseAction, initialState);

  return (
    <Form key={state.revision} action={formAction} errors={state.fieldErrors}>
      {state.message ? <p role={state.ok ? "status" : "alert"} className="text-sm">{state.message}</p> : null}
      <FormField name="phrase">
        <FormItem>
          <FormLabel>Nowa zabroniona fraza</FormLabel>
          <div className="flex gap-2">
            <FormControl>
              <Input name="phrase" defaultValue={state.values.phrase} placeholder="Dodaj zabronioną frazę..." required />
            </FormControl>
            {children}
          </div>
          <FormDescription>Od 1 do 50 znaków, bez rozróżniania wielkości liter.</FormDescription>
          <FormMessage aria-live="polite" />
        </FormItem>
      </FormField>
    </Form>
  );
}
