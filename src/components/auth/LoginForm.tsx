"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserRole } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link } from "@i18n/navigation";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email) return setError(t("errors.emailRequired"));
    if (!password) return setError(t("errors.passwordRequired"));

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        setError(t("errors.invalidCredentials"));
        return;
      }

      // Use user from sign-in response — no extra getUser() round-trip needed
      const role = await getUserRole(supabase, data.user.id);
      if (role === "admin") {
        router.push("/admin/payments");
      } else if (role === "professor") {
        router.push("/");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Input
        id="email"
        type="email"
        label={t("email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />
      <Input
        id="password"
        type="password"
        label={t("password")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
        {t("loginButton")}
      </Button>

      <p className="text-sm text-center text-gray-600">
        {t("noAccount")}{" "}
        <Link href="/auth/register" className="text-[var(--color-primary-600)] font-medium hover:underline">
          {t("signUpLink")}
        </Link>
      </p>
    </form>
  );
}
