"use client";

import { useActionState, useState } from "react";
import { createForbiddenPhraseAction, type ActionState } from "@/app/actions";
import { SubmitButton } from "@/components/products/submit-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const initialState: ActionState = { ok: false };

export function ForbiddenPhraseForm() {
  const [formKey, setFormKey] = useState(0);

  const [state, formAction] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await createForbiddenPhraseAction(prev, formData);
      if (result.ok) {
        setFormKey((k) => k + 1);
      }
      return result;
    },
    initialState,
  );

  return (
    <Form key={formKey} action={formAction} errors={state.fieldErrors}>
      <FormField name="phrase">
        <FormItem>
          <FormLabel>Nowa zabroniona fraza</FormLabel>
          <div className="flex gap-2">
            <FormControl>
              <Input name="phrase" placeholder="Dodaj zabronioną frazę..." required />
            </FormControl>
            <SubmitButton>Dodaj</SubmitButton>
          </div>
          <FormMessage />
        </FormItem>
      </FormField>
    </Form>
  );
}
