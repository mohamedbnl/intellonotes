import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PaymentQueue } from "@/components/admin/PaymentQueue";
import type { PurchaseItem } from "@/components/admin/PaymentConfirmCard";
import type { CourseLanguage } from "@/types/database";

// ── Local types (DB rows returned by Supabase join) ───────────────────────────

type PurchaseRow = {
  id: string;
  amount_paid: number;
  purchased_at: string;
  users: { name: string; email: string } | null;
  courses: { title: string; language: CourseLanguage } | null;
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.payments" });
  return { title: t("title") };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "admin.payments" });

  const supabase = await createClient();

  // Fetch pending purchases FIFO joined with student + course details
  const { data } = (await supabase
    .from("purchases")
    .select("id, amount_paid, purchased_at, users(name, email), courses(title, language)")
    .eq("status", "pending")
    .order("purchased_at", { ascending: true })) as unknown as {
    data: PurchaseRow[] | null;
    error: unknown;
  };

  const purchases: PurchaseItem[] = (data ?? [])
    .filter((p) => p.users !== null && p.courses !== null)
    .map((p) => ({
      id: p.id,
      amount_paid: p.amount_paid,
      purchased_at: p.purchased_at,
      student_name: p.users!.name,
      student_email: p.users!.email,
      course_title: p.courses!.title,
      course_language: p.courses!.language,
    }));

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        {purchases.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {purchases.length} {t("pending").toLowerCase()}
          </p>
        )}
      </div>

      <PaymentQueue purchases={purchases} />
    </main>
  );
}
