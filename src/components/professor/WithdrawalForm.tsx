"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requestWithdrawal } from "@/lib/actions/withdrawal";
import { MIN_WITHDRAWAL_AMOUNT } from "@/lib/constants";

interface WithdrawalFormProps {
  availableBalance: number;
}

export function WithdrawalForm({ availableBalance }: WithdrawalFormProps) {
  const t = useTranslations("professor.earnings");
  const locale = useLocale();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canWithdraw = availableBalance >= MIN_WITHDRAWAL_AMOUNT;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < MIN_WITHDRAWAL_AMOUNT) {
      setError(t("withdrawalBelowMin", { amount: MIN_WITHDRAWAL_AMOUNT }));
      return;
    }
    if (numAmount > availableBalance) {
      setError(t("withdrawalExceedsBalance"));
      return;
    }

    setIsSubmitting(true);
    const result = await requestWithdrawal(numAmount, locale);
    setIsSubmitting(false);

    if (result.error) {
      if (result.error === "belowMinimum") {
        setError(t("withdrawalBelowMin", { amount: MIN_WITHDRAWAL_AMOUNT }));
      } else if (result.error === "insufficientBalance") {
        setError(t("withdrawalExceedsBalance"));
      } else {
        setError(t("withdrawalError"));
      }
      return;
    }

    setSuccess(true);
    setAmount("");
    router.refresh();
  }

  if (!canWithdraw) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{t("requestWithdrawal")}</h3>
        <p className="text-sm text-gray-500">
          {t("withdrawalNotAvailable", { amount: MIN_WITHDRAWAL_AMOUNT })}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{t("requestWithdrawal")}</h3>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            id="withdrawal-amount"
            type="number"
            min={MIN_WITHDRAWAL_AMOUNT}
            max={availableBalance}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`${MIN_WITHDRAWAL_AMOUNT} - ${availableBalance.toFixed(2)} Dh`}
          />
        </div>
        <Button type="submit" isLoading={isSubmitting}>
          {t("submitWithdrawal")}
        </Button>
      </form>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {success && <p className="text-sm text-green-600 mt-2">{t("withdrawalSuccess")}</p>}
    </div>
  );
}
