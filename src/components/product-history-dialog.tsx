"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProductHistoryDialog({ productId, children }: {
  productId: number;
  children: ReactNode;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const title = `Historia zmian produktu #${productId}`;
  const description = "Operacje oraz wartości produktu przed i po zmianie.";

  function onOpenChangeComplete(isOpen: boolean) {
    if (isOpen) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("history");
    router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
  }

  function finalFocus() {
    return document.getElementById(`product-history-${productId}`);
  }

  if (isDesktop === null) return null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen} onOpenChangeComplete={onOpenChangeComplete}>
        <DialogContent className="max-h-[85dvh] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-4xl" finalFocus={finalFocus}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60dvh] min-h-0">
            <div className="p-1 pr-4">{children}</div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Zamknij</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen} onOpenChangeComplete={onOpenChangeComplete}>
      <SheetContent side="bottom" className="max-h-[85dvh]" finalFocus={finalFocus}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[60dvh] min-h-0 px-4">
          <div className="p-1 pr-4">{children}</div>
        </ScrollArea>
        <SheetFooter>
          <SheetClose render={<Button variant="outline" />}>Zamknij</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
