"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { PaymentConfirmCard } from "./PaymentConfirmCard";
import type { PurchaseItem } from "./PaymentConfirmCard";

export function PaymentQueue({ purchases }: { purchases: PurchaseItem[] }) {
  const t = useTranslations("admin.payments");
  const router = useRouter();

  // Refresh the page when a new pending purchase arrives
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-pending-purchases")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "purchases",
          filter: "status=eq.pending",
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  if (purchases.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {purchases.map((purchase) => (
        <PaymentConfirmCard key={purchase.id} purchase={purchase} />
      ))}
    </div>
  );
}
