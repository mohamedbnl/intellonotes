import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LoginPageContent />;
}

function LoginPageContent() {
  const t = useTranslations("auth");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t("loginTitle")}
          </h1>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
