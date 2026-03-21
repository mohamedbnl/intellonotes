import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/queries";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // user is non-null here — redirect() above throws internally in Next.js
  const role = await getUserRole(supabase, user!.id);

  if (role !== "admin") {
    redirect(`/${locale}`);
  }

  return <>{children}</>;
}
