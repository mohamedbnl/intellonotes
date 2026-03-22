import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCoursesForAdmin } from "@/lib/db/queries";
import { CourseReviewQueue } from "@/components/admin/CourseReviewQueue";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.meta" });
  return { title: t("title") };
}

export default async function AdminCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, session] = await Promise.all([
    getTranslations("admin.courses"),
    auth(),
  ]);

  if (!session?.user || session.user.role !== "admin") {
    redirect(`/${locale}/auth/login`);
  }

  const rows = getCoursesForAdmin();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <span className="text-sm text-gray-500">({rows.length})</span>
      </div>

      <CourseReviewQueue courses={rows} />
    </main>
  );
}
