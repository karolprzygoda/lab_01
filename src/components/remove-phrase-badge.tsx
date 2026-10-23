"use client";

import { useFormStatus } from "react-dom";
import { XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RemovePhraseBadge({ phrase }: { phrase: string }) {
  const { pending } = useFormStatus();

  return (
    <Badge
      variant="destructive"
      render={<button type="submit" disabled={pending} aria-busy={pending} aria-label={`Usuń frazę ${phrase}`} />}
    >
      {phrase}
      <XIcon data-icon="inline-end" aria-hidden="true" />
    </Badge>
  );
}
