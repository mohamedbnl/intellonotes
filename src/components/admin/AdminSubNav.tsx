"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@i18n/navigation";
import { cn } from "@/lib/utils/cn";

export function AdminSubNav() {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  const tabs = [
    { href: "/admin/courses", label: t("courses") },
    { href: "/admin/payments", label: t("payments") },
    { href: "/admin/withdrawals", label: t("withdrawals") },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-6" aria-label="Admin navigation">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "py-3 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-[var(--color-primary-600)] text-[var(--color-primary-600)]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
