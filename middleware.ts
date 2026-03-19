import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./src/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Handle i18n locale routing first
  const intlResponse = intlMiddleware(request);

  // 2. Refresh Supabase session on the response
  return await updateSession(request, intlResponse as NextResponse);
}

export const config = {
  matcher: [
    // Match all pathnames except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
