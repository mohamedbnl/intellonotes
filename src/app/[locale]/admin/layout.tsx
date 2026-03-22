import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSubNav } from "@/components/admin/AdminSubNav";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  if (session.user.role !== "admin") {
    redirect(`/${locale}`);
  }

  return (
    <>
      <AdminSubNav />
      {children}
    </>
  );
}
