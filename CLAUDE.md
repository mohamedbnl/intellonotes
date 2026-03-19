# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IntelloNotes is an e-learning marketplace for Moroccan university students to learn programming languages (49-78 Dh/course). Three roles: **student** (browse, buy, learn), **professor** (publish courses, earn 70% commission), **admin** (review courses, confirm payments). Manual payment via CashPlus/bank transfer. Bilingual: French (default) + Arabic (RTL).

## Tech Stack

- **Next.js 14+ App Router** with TypeScript and Tailwind CSS
- **Supabase**: PostgreSQL, Auth (role-based), Storage (course PDFs), Realtime (purchase unlock)
- **next-intl**: i18n with locales `['fr', 'ar']`, default `fr`
- **react-pdf**: in-browser PDF rendering (dynamically imported, ssr: false)
- **@monaco-editor/react**: code editor with syntax highlighting for all languages
- **Pyodide**: Python execution in a Web Worker (lazy-loaded ~10MB); JS execution via `new Function()`; C/Java/SQL are syntax-only (no execution)
- **Vitest**: unit and component tests

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint
npx vitest               # Run all tests
npx vitest run <file>    # Run a single test file
npx supabase start       # Start local Supabase (Docker required)
npx supabase db reset    # Drop and recreate DB from migrations + seed
npx supabase gen types typescript --local > src/types/database.ts  # Regenerate DB types
```

## Folder Structure

```
intellonotes/
├── .env.local / .env.example
├── next.config.ts
├── tailwind.config.ts
├── middleware.ts                    # next-intl locale routing + Supabase session refresh
├── i18n/
│   ├── routing.ts                  # locales: ['fr','ar'], default: 'fr'
│   ├── request.ts                  # getRequestConfig
│   └── navigation.ts              # createNavigation exports
├── messages/
│   ├── fr.json
│   └── ar.json
├── supabase/
│   ├── migrations/                 # 00001-00008 SQL files
│   └── seed.sql
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx          # Root: html lang/dir, fonts, providers
│   │   │   ├── page.tsx            # Homepage = course catalog
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   └── callback/route.ts
│   │   │   ├── courses/
│   │   │   │   └── [courseId]/
│   │   │   │       ├── page.tsx    # Course detail
│   │   │   │       └── learn/page.tsx  # Learning interface
│   │   │   ├── dashboard/page.tsx  # Student dashboard
│   │   │   └── admin/
│   │   │       ├── layout.tsx      # Admin role guard
│   │   │       └── payments/page.tsx
│   │   └── api/webhooks/           # Future stubs
│   ├── components/
│   │   ├── ui/                     # Button, Card, Badge, Input, Modal, Spinner
│   │   ├── layout/                 # Header, Footer, MobileNav
│   │   ├── auth/                   # LoginForm, RegisterForm, RoleGuard
│   │   ├── courses/                # CourseCard, CourseGrid, SearchBar, FilterChips, AxisTOC, PurchaseButton
│   │   ├── learning/               # PDFViewer, ProgressSidebar, QuizEngine, QuizQuestion, CodePlayground
│   │   ├── dashboard/              # PurchasedCourseCard, ProgressBar
│   │   └── admin/                  # PaymentQueue, PaymentConfirmCard
│   ├── lib/
│   │   ├── supabase/               # client.ts, server.ts, middleware.ts, admin.ts
│   │   ├── utils/                  # cn.ts, commission.ts, quiz-grader.ts
│   │   ├── pyodide/worker.ts       # Web Worker for Python execution
│   │   └── constants.ts            # Axis labels, languages, levels, price range
│   ├── hooks/                      # useAuth, useCourseProgress, useRealtimePurchase, usePyodide
│   └── types/                      # database.ts (generated), quiz.ts, index.ts
```

## Architecture

### Routing & i18n

All pages live under `src/app/[locale]/`. The root `middleware.ts` chains **next-intl locale detection** with **Supabase session refresh**. i18n config lives in `i18n/` (routing, request, navigation). Translations in `messages/fr.json` and `messages/ar.json`.

For Arabic, `<html dir="rtl">` is set in the root layout. Use Tailwind logical properties throughout: `ms-`/`me-` (not `ml-`/`mr-`), `ps-`/`pe-`, `text-start`/`text-end`, `start-0`/`end-0`.

### Supabase Clients

- `src/lib/supabase/client.ts` — browser client (`createBrowserClient`)
- `src/lib/supabase/server.ts` — server client with cookies (`createServerClient`)
- `src/lib/supabase/middleware.ts` — session refresh helper for middleware
- `src/lib/supabase/admin.ts` — service-role client (seed/admin ops only)

### The 5-Axis Pedagogical Model

Every course follows 5 mandatory axes: Introduction → Theory → Practice → Synthesis → Final Evaluation. Students progress sequentially — each axis quiz must be passed before the next unlocks. Axis content gating is enforced at the **application layer** (not RLS). RLS handles row-level ownership only.

### Database

Tables: `users`, `courses`, `lessons`, `quizzes`, `purchases`, `progress`, `withdrawals`. Migrations in `supabase/migrations/` (numbered SQL files). After any schema change, regenerate types with `supabase gen types`.

Key relationships: `courses.professor_id → users.id`, `lessons.course_id → courses.id` with `axis_number` (1-5), `quizzes.lesson_id → lessons.id`. A DB trigger on `auth.users` insert auto-creates the `public.users` row.

### Quiz System

Quiz questions stored as JSONB arrays with three types: `mcq`, `true_false`, `fill_blank`. Grading is **client-side** (`src/lib/utils/quiz-grader.ts`). Scores saved to `progress.quiz_scores` (JSONB). Passing threshold: 70% for Axis 5 final evaluation.

### Commission Model

70% professor / 30% platform, calculated via `src/lib/utils/commission.ts` on each confirmed purchase. Purchases use a state machine: `pending → confirmed | rejected`. Admin confirms manually; Supabase Realtime pushes the unlock to the student.

### Code Playground

Monaco editor is dynamically imported (ssr: false). Pyodide runs in a dedicated Web Worker (`src/lib/pyodide/worker.ts`), loaded lazily on first Python execution. The `usePyodide` hook manages worker lifecycle. For JavaScript, execution uses `new Function()` with captured console output. C, Java, and SQL show syntax highlighting only with a disabled Run button.

### Role Guards

Protected routes use `RoleGuard` component or server-side session checks in layout files. Admin pages live under `src/app/[locale]/admin/` with a guarded layout. The admin user is seeded via `supabase/seed.sql`.

## Conventions

### Styling & Layout
- Mobile-first responsive design: grid columns 1 (mobile) → 2 (tablet) → 3 (desktop)
- Always use Tailwind logical properties for RTL support: `ms-`/`me-`, `ps-`/`pe-`, `text-start`/`text-end`, `start-0`/`end-0` — NEVER `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`
- Classname utility: `src/lib/utils/cn.ts` (`clsx` + `tailwind-merge`) — use `cn()` for all conditional classes
- Color palette: use CSS variables defined in `tailwind.config.ts` — primary (purple), secondary (teal), accent (coral), warning (amber)
- Dark mode is NOT in scope for MVP

### Component Patterns
- Heavy client components (PDFViewer, CodePlayground, QuizEngine) must use `next/dynamic` with `ssr: false`
- All components must be typed with explicit Props interfaces — no `any` types
- Use `"use client"` directive only when the component genuinely needs browser APIs, hooks, or event handlers
- Server components are the default — fetch data on the server whenever possible
- Loading states: use Skeleton components, never blank screens
- Error boundaries: wrap each major section (PDF viewer, quiz, code playground) in its own error boundary

### Data Fetching
- Server components fetch data via `src/lib/supabase/server.ts`
- Client components use hooks from `src/hooks/` that call the browser Supabase client
- Never expose the service-role key to the client — `admin.ts` is server-only
- After any mutation (purchase, quiz submit, course status change), revalidate with `router.refresh()` or `revalidatePath()`

### Database Rules
- Supabase DB types are auto-generated — NEVER edit `src/types/database.ts` by hand
- After any migration change, always run: `npx supabase gen types typescript --local > src/types/database.ts`
- All new tables must have RLS enabled with appropriate policies
- Use Supabase Realtime subscriptions only for: purchase status changes (student waiting for confirmation)

### Business Logic Rules
- Course prices must avoid the digit 9 (use 49, 56, 68, 78 Dh)
- Commission split: always compute via `commission.ts` — never hardcode 0.7/0.3 in components
- PDF uploads capped at 20MB; stored in Supabase Storage bucket `course-pdfs` with signed URLs
- Quiz passing threshold: 70% for Axis 5, no minimum for Axes 1-4 (but all questions must be answered)
- Axis progression is strictly sequential — never allow skipping axes even via URL manipulation
- Purchase states: `pending` → `confirmed` | `rejected` — no other transitions allowed

### File & Naming Conventions
- Files: kebab-case (`course-card.tsx`, `quiz-grader.ts`)
- Components: PascalCase (`CourseCard`, `QuizEngine`)
- Hooks: camelCase with `use` prefix (`useAuth`, `usePyodide`)
- Types: PascalCase, suffix with purpose (`CourseWithProfessor`, `QuizQuestion`, `PurchaseStatus`)
- Constants: UPPER_SNAKE_CASE for enum-like values (`AXIS_LABELS`, `SUPPORTED_LANGUAGES`)
- Supabase migration files: sequential numbered prefix (`00001_create_users.sql`)

### Testing
- Write tests for all utility functions (`commission.ts`, `quiz-grader.ts`)
- Write tests for hooks that contain business logic
- Component tests use `@testing-library/react`
- No tests needed for pure layout/UI components at MVP stage

## Common Pitfalls — Read Before Coding

1. **next-intl + Supabase middleware conflict:** The middleware must chain both in the correct order — locale detection first, then Supabase session refresh. See `middleware.ts` for the pattern.
2. **react-pdf SSR crash:** react-pdf uses browser APIs — always dynamically import with `ssr: false`. It will crash the build otherwise.
3. **Monaco Editor bundle size:** Monaco is ~2MB. Use `@monaco-editor/react` (not raw `monaco-editor`) and dynamically import it. Never import at the top level of a page.
4. **Pyodide initial load:** Pyodide is ~10MB on first load. Show a clear loading indicator. Never auto-load — only initialize when the student clicks "Run" for the first time.
5. **RTL layout breaks:** If something looks wrong in Arabic, check for hardcoded `left`/`right`/`ml-`/`mr-` — replace with logical properties.
6. **Supabase RLS lockout:** If a query returns empty when it shouldn't, check RLS policies first. Use the Supabase dashboard SQL editor (bypasses RLS) to verify data exists.
7. **File upload size:** Supabase Storage has its own size limits. Set the `course-pdfs` bucket max file size to 20MB in the Supabase dashboard.
8. **Auth callback redirect:** After login/signup, the Supabase callback at `/auth/callback` must redirect based on user role — student → `/dashboard`, professor → `/professor`, admin → `/admin`.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=          # Server-only — never expose to client
NEXT_PUBLIC_SITE_URL=               # http://localhost:3000 in dev, production URL in prod
```
## Skills
See `.claude/skills/` for detailed implementation guides on recurring tasks.
