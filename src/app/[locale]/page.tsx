import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("catalog");

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-start">{t("title")}</h1>
      <p className="mt-2 text-gray-600 text-start">{t("subtitle")}</p>
      {/* CourseGrid will be added in Feature 4 */}
    </main>
  );
}
