"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@i18n/navigation";
import { Button } from "@/components/ui/Button";
import { processWithdrawal, rejectWithdrawal } from "@/lib/actions/admin";

interface WithdrawalItem {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  professor_name: string;
  professor_email: string;
}

interface WithdrawalQueueProps {
  withdrawals: WithdrawalItem[];
}

export function WithdrawalQueue({ withdrawals }: WithdrawalQueueProps) {
  const t = useTranslations("admin.withdrawals");
  const locale = useLocale();
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  async function handleProcess(id: string) {
    setProcessingId(id);
    await processWithdrawal(id, locale);
    setProcessingId(null);
    router.refresh();
  }

  async function handleReject(id: string) {
    setRejectingId(id);
    await rejectWithdrawal(id, locale);
    setRejectingId(null);
    router.refresh();
  }

  if (withdrawals.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">{t("empty")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-start">
            <th className="py-3 pe-4 text-start font-semibold text-gray-500">{t("professor")}</th>
            <th className="py-3 pe-4 text-start font-semibold text-gray-500">{t("email")}</th>
            <th className="py-3 pe-4 text-end font-semibold text-gray-500">{t("amount")}</th>
            <th className="py-3 pe-4 text-start font-semibold text-gray-500">{t("date")}</th>
            <th className="py-3 text-end font-semibold text-gray-500">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((w) => (
            <tr key={w.id} className="border-b border-gray-100">
              <td className="py-3 pe-4 text-gray-900 font-medium">{w.professor_name}</td>
              <td className="py-3 pe-4 text-gray-600">{w.professor_email}</td>
              <td className="py-3 pe-4 text-end font-semibold text-gray-900">{w.amount} Dh</td>
              <td className="py-3 pe-4 text-gray-600">
                {new Intl.DateTimeFormat(locale, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(new Date(w.requested_at))}
              </td>
              <td className="py-3 text-end">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    isLoading={processingId === w.id}
                    disabled={rejectingId === w.id}
                    onClick={() => handleProcess(w.id)}
                  >
                    {t("confirm")}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    isLoading={rejectingId === w.id}
                    disabled={processingId === w.id}
                    onClick={() => handleReject(w.id)}
                  >
                    {t("reject")}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
