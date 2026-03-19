# Skill: Create a new page

## When to use

Use this skill every time you create a new page in IntelloNotes. Every page must handle i18n (French/Arabic), RTL layout for Arabic, and role-based access when the page is protected.

## Page location

All pages live under `src/app/[locale]/`. The `[locale]` segment is handled by next-intl middleware — never hardcode `fr` or `ar` in paths.

```
src/app/[locale]/
├── page.tsx                        # Homepage (public) — course catalog
├── auth/
│   ├── login/page.tsx              # Public
│   └── register/page.tsx           # Public
├── courses/
│   └── [courseId]/
│       ├── page.tsx                # Public — course detail
│       └── learn/page.tsx          # Protected — student only (must own course)
├── dashboard/page.tsx              # Protected — student only
├── professor/
│   ├── page.tsx                    # Protected — professor only
│   └── courses/
│       └── new/page.tsx            # Protected — professor only
└── admin/
    ├── layout.tsx                  # Role guard for all admin pages
    ├── page.tsx                    # Protected — admin only
    ├── review/page.tsx             # Protected — admin only
    └── payments/page.tsx           # Protected — admin only
```

## Public page template

For pages that anyone can access (catalog, course detail, login, register):

```tsx
// src/app/[locale]/example/page.tsx

import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

// Metadata (server-side)
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "ExamplePage" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

// Page component (server component by default)
export default function ExamplePage() {
  const t = useTranslations("ExamplePage");

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-start">{t("heading")}</h1>
      <p className="mt-4 text-start text-gray-600">{t("description")}</p>
    </main>
  );
}
```

## Protected page template (with role guard)

For pages that require authentication and a specific role:

```tsx
// src/app/[locale]/dashboard/page.tsx

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServerClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  return { title: t("meta.title") };
}

export default async function DashboardPage() {
  const supabase = createServerClient();
  const t = await getTranslations("Dashboard");

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/");
  }

  // Fetch page data
  const { data: purchases } = await supabase
    .from("purchases")
    .select("*, course:courses(*)")
    .eq("student_id", user.id)
    .eq("status", "confirmed");

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-start">{t("heading")}</h1>
      {/* Page content */}
    </main>
  );
}
```

## Protected layout template (for route groups)

For sections where ALL pages require the same role (e.g., `/admin/*`):

```tsx
// src/app/[locale]/admin/layout.tsx

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
```

## Translation file pattern

Every page needs corresponding entries in both translation files:

```json
// messages/fr.json
{
  "ExamplePage": {
    "meta": {
      "title": "Exemple — IntelloNotes",
      "description": "Description de la page"
    },
    "heading": "Titre de la page",
    "description": "Contenu de la page"
  }
}
```

```json
// messages/ar.json
{
  "ExamplePage": {
    "meta": {
      "title": "مثال — IntelloNotes",
      "description": "وصف الصفحة"
    },
    "heading": "عنوان الصفحة",
    "description": "محتوى الصفحة"
  }
}
```

**Rule:** Always add both `fr.json` and `ar.json` entries when creating a page. Never leave one empty.

## RTL styling rules

Every page must work in both LTR (French) and RTL (Arabic). Follow these rules strictly:

```tsx
// NEVER use these — they break in RTL:
<div className="ml-4 mr-2 pl-6 text-left float-right left-0" />

// ALWAYS use logical properties:
<div className="ms-4 me-2 ps-6 text-start float-end start-0" />
```

**Full mapping:**

| Physical (WRONG) | Logical (CORRECT) |
|---|---|
| `ml-*` | `ms-*` |
| `mr-*` | `me-*` |
| `pl-*` | `ps-*` |
| `pr-*` | `pe-*` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `left-*` | `start-*` |
| `right-*` | `end-*` |
| `float-left` | `float-start` |
| `float-right` | `float-end` |
| `border-l-*` | `border-s-*` |
| `border-r-*` | `border-e-*` |
| `rounded-l-*` | `rounded-s-*` |
| `rounded-r-*` | `rounded-e-*` |

**Exception:** `mx-*`, `px-*`, `text-center` are symmetric and safe to use.

## Client-side page with heavy components

When a page needs browser-only components (PDF viewer, code editor, quiz engine), use dynamic imports:

```tsx
// src/app/[locale]/courses/[courseId]/learn/page.tsx

import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("@/components/learning/PDFViewer"), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse rounded-lg bg-gray-200" />,
});

const CodePlayground = dynamic(
  () => import("@/components/learning/CodePlayground"),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-lg bg-gray-200" />,
  }
);

const QuizEngine = dynamic(
  () => import("@/components/learning/QuizEngine"),
  {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse rounded-lg bg-gray-200" />,
  }
);
```

## Checklist before creating any page

- [ ] Page is inside `src/app/[locale]/`
- [ ] `generateMetadata` is defined with translated title
- [ ] Translation keys added to BOTH `fr.json` and `ar.json`
- [ ] Protected pages check auth + role and redirect if unauthorized
- [ ] All styling uses logical properties (no `ml-`/`mr-`/`left-`/`right-`)
- [ ] `text-start` used instead of `text-left`
- [ ] Heavy components use `next/dynamic` with `ssr: false`
- [ ] Loading skeletons provided for dynamic imports
- [ ] Page is responsive: stacks on mobile, expands on desktop
