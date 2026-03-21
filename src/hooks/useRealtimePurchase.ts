"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PurchaseStatus } from "@/types/database";

/**
 * Subscribes to UPDATE events on public.purchases for the given user+course pair.
 * Fires onStatusChange when the admin confirms or rejects the purchase.
 *
 * IMPORTANT: Realtime must be enabled on the `purchases` table in the Supabase
 * dashboard (Database → Replication → Supabase Realtime → purchases).
 *
 * Passing userId=null disables the subscription (used to skip when not pending).
 */
export function useRealtimePurchase(
  userId: string | null,
  courseId: string,
  onStatusChange: (status: PurchaseStatus) => void
): void {
  // Store callback in a ref so the effect doesn't depend on it —
  // prevents re-subscribing every time the parent re-renders.
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`purchase-${userId}-${courseId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "purchases",
          filter: `student_id=eq.${userId}`,
        },
        (payload) => {
          const record = payload.new as { course_id: string; status: string };
          // Filter client-side for the specific course (Supabase filters only
          // support one column at the postgres_changes level).
          if (record.course_id === courseId) {
            onStatusChangeRef.current(record.status as PurchaseStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, courseId]); // intentionally excludes callback — handled via ref
}
