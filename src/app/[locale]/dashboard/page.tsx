import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/queries";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const role = await getUserRole(supabase, user!.id);

  if (role !== "student") {
    redirect(`/${locale}`);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Mes cours</h1>
      <p className="text-gray-500 mt-2">
        Tableau de bord — disponible dans Feature 8.
      </p>
    </main>
  );
}
