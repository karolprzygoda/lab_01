import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";

export function ActionLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={buttonVariants({ variant: "outline", size: "sm", className })} {...props} />;
}
