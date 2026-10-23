"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToastManager } from "@/components/ui/toast";
import type { Notification } from "@/lib/action-state";

export function NotificationToast({ notification }: { notification: Notification }) {
  const router = useRouter();
  const { add } = useToastManager();
  const { id, title, type } = notification;

  useEffect(() => {
    add({ id, title, type });

    const url = new URL(window.location.href);
    const noticeId = url.searchParams.get("noticeId") ?? url.searchParams.get("notice");
    if (noticeId === id) {
      url.searchParams.delete("notice");
      url.searchParams.delete("noticeId");
      router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
    }
  }, [id, title, type, router, add]);

  return null;
}
