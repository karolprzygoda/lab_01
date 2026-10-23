"use client";

import { toast } from "@/components/ui/toast";
import type { ActionState } from "@/lib/action-state";

export async function withActionToast<T>(action: Promise<ActionState<T>>) {
  const result = await action;
  if (result.message) {
    toast.add({
      title: result.message,
      description: result.fieldErrors ? Object.values(result.fieldErrors).join(" ") : undefined,
      type: result.ok ? "success" : "error",
    });
  }
  return result;
}
