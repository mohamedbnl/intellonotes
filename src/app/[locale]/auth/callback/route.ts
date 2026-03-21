import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const role = await getUserRole(supabase, user.id);

        if (role === "admin") {
          return NextResponse.redirect(`${origin}/${locale}/admin/payments`);
        }
        if (role === "professor") {
          return NextResponse.redirect(`${origin}/${locale}`);
        }
        return NextResponse.redirect(`${origin}/${locale}/dashboard`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/auth/login`);
}
