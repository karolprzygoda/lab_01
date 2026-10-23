import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function ActionLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn(
    "inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium transition-colors hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2",
    className,
  )} {...props} />;
}
