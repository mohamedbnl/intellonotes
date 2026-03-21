import { setRequestLocale } from "next-intl/server";

export default async function AdminPaymentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Confirmations de paiement
      </h1>
      <p className="text-gray-500 mt-2">
        Interface de paiement — disponible dans Feature 9.
      </p>
    </main>
  );
}
