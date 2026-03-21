"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4 text-center">
      <p className="text-gray-600">{t("error")}</p>
      <Button variant="secondary" onClick={reset}>
        {t("retry")}
      </Button>
    </div>
  );
}
