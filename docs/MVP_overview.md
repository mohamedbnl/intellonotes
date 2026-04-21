# IntelloNotes — MVP Overview

## Concept

IntelloNotes is a bilingual e-learning marketplace for Moroccan university students to learn programming languages. Courses are sold at fixed prices (49, 56, 68, or 78 Dh) and cover Python, JavaScript, C, Java, HTML/CSS, and SQL.

Payment is manual — students transfer money via CashPlus or bank transfer, then an admin confirms the payment. There is no online payment gateway.

The platform is bilingual: **French** (default) and **Arabic** (RTL layout). URL routing is locale-prefixed: `/fr/...` and `/ar/...`.

---

## User Roles

### Student
- Browse the course catalog with search and filters (language, level)
- Purchase courses by declaring a manual payment
- Learn through the 5-axis model: PDF material, lesson content, code playground, and quizzes
- Track progress on a personal dashboard

### Professor
- Create courses: fill in metadata (title, description, language, level, price, objectives, prerequisites) and content for all 5 axes (lesson text + quiz per axis)
- Submit courses for admin review
- View earnings dashboard: total earned, available balance, withdrawal history
- Request payouts (minimum 100 Dh, against available balance)

### Admin
- Review pending courses: approve (publishes to catalog) or reject with a written reason
- Suspend approved courses
- Confirm or reject pending student payments
- Process or reject professor withdrawal requests

---

## The 5-Axis Pedagogical Model

Every course is structured into exactly 5 sequential axes:

| Axis | Name               | Description                                       |
|------|--------------------|---------------------------------------------------|
| 1    | Introduction       | Overview of the topic and foundational concepts   |
| 2    | Theory             | In-depth theoretical knowledge                    |
| 3    | Practice           | Hands-on exercises and applied examples           |
| 4    | Synthesis          | Consolidation and integration of knowledge        |
| 5    | Final Evaluation   | Comprehensive quiz (70% pass threshold required)  |

**Progression rules:**
- Axes are unlocked sequentially — a student must pass the quiz of Axis N before Axis N+1 becomes available
- Axes 1–4: any quiz completion counts as a pass (no minimum score)
- Axis 5: must score **≥ 70%** to complete the course
- Skipping axes via URL manipulation is blocked at the application layer

---

## Course Lifecycle

```
draft → pending → approved   (visible in catalog)
                ↘ rejected   (professor gets feedback reason, can revise and resubmit)

approved → suspended         (admin action, removes from catalog)
```

1. Professor creates a course (starts as `draft`)
2. Professor fills all 5 axes (lesson + quiz per axis)
3. Professor submits for review → status becomes `pending`
4. Admin reviews: **approve** (status → `approved`) or **reject** with reason (status → `rejected`)
5. Professor can revise a rejected course and resubmit
6. Admin can **suspend** an approved course at any time

---

## Purchase Flow

```
Student pays (CashPlus/bank) → marks "I have paid" → purchase status: pending
                                                       ↓
                                              Admin reviews payment
                                               ↙            ↘
                                        confirmed          rejected
                                    (course unlocked)   (student notified)
```

- `usePurchasePolling` polls `/api/purchase-status` every 5 seconds on the student side
- Once confirmed, the learning interface unlocks automatically without a page refresh

---

## Commission Model

| Recipient | Share |
|-----------|-------|
| Professor | 70%   |
| Platform  | 30%   |

- Commission is calculated on each confirmed purchase via `src/lib/utils/commission.ts`
- Professors see a breakdown per transaction in their earnings dashboard
- Withdrawals: minimum 100 Dh, only against available balance (earned − withdrawn − pending)

---

## Learning Experience

Each axis provides:

1. **PDF Viewer** — Course material rendered in-browser via `react-pdf` (dynamically imported, `ssr: false`)
2. **Lesson Content** — Structured text content per lesson within the axis
3. **Code Playground** — Browser-based editor (Monaco) with execution:
   - Python: runs via Pyodide (WebAssembly Worker, lazy-loaded ~10 MB on first use)
   - JavaScript: runs via `new Function()` with captured console output
   - C, Java, SQL, HTML/CSS: syntax highlighting only (no execution)
4. **Quiz** — One quiz per axis with three question types:
   - **MCQ**: multiple-choice with one correct answer
   - **True/False**: binary answer
   - **Fill in the Blank**: free text, configurable case sensitivity, multiple valid answers

After quiz submission:
- Score is displayed immediately (client-side grading via `quiz-grader.ts`)
- Correct answers are revealed for wrong responses
- On pass: next axis unlocks after 1.2 s
- On fail (Axis 5 only): retry button appears

---

## Database — 7 Tables

| Table         | Purpose                                                       |
|---------------|---------------------------------------------------------------|
| `users`       | All users (student, professor, admin) with bcrypt password    |
| `courses`     | Course metadata, status, language, level, price               |
| `lessons`     | One lesson per axis per course (axis_number 1–5)              |
| `quizzes`     | One quiz per lesson, questions stored as JSON                  |
| `purchases`   | Purchase records with status (pending/confirmed/rejected)     |
| `progress`    | Per-student per-course: current axis, quiz scores, completion |
| `withdrawals` | Professor payout requests with status                         |

**ORM:** Drizzle ORM (SQLite via better-sqlite3, WAL mode, foreign keys ON)

---

## Tech Stack

| Layer             | Technology                                      |
|-------------------|-------------------------------------------------|
| Framework         | Next.js 16 (App Router) + TypeScript            |
| Styling           | Tailwind CSS 4 (logical properties for RTL)     |
| Database          | SQLite + Drizzle ORM (better-sqlite3)           |
| Authentication    | Auth.js v5 — Credentials provider, JWT strategy |
| i18n              | next-intl — locales: `fr` (default), `ar`       |
| PDF rendering     | react-pdf (dynamic import, `ssr: false`)        |
| Code editor       | @monaco-editor/react (dynamic import)           |
| Python execution  | Pyodide in a Web Worker                         |
| Testing           | Vitest + @testing-library/react                 |

---

## Key Pages

### Public
| Route                     | Description                                                      |
|---------------------------|------------------------------------------------------------------|
| `/`                       | Landing: hero, value props, 5-axis explanation, featured courses |
| `/courses`                | Catalog with search bar and language/level filter chips          |
| `/courses/[id]`           | Course detail: objectives, prerequisites, axis TOC, purchase CTA |
| `/auth/login`             | Login form                                                       |
| `/auth/register`          | Registration with role selection (student or professor)          |

### Student (protected)
| Route                     | Description                                                      |
|---------------------------|------------------------------------------------------------------|
| `/dashboard`              | Enrolled courses with 5-segment axis progress bars               |
| `/courses/[id]/learn`     | Full learning interface (sidebar + PDF + lessons + quiz + code)  |
| `/profile`                | Edit name and profile info                                       |

### Professor (protected)
| Route                          | Description                                              |
|--------------------------------|----------------------------------------------------------|
| `/professor/courses`           | Course list with status badges and actions               |
| `/professor/courses/new`       | Create course form                                       |
| `/professor/courses/[id]`      | 5-axis editor: lesson content + quiz builder per axis    |
| `/professor/earnings`          | Earnings breakdown, transaction history, withdrawal form |

### Admin (protected)
| Route                     | Description                                                      |
|---------------------------|------------------------------------------------------------------|
| `/admin/courses`          | Course review queue: approve, reject, suspend                    |
| `/admin/payments`         | Payment confirmation queue                                       |
| `/admin/withdrawals`      | Withdrawal processing queue                                      |

---

## Authentication

- **Provider:** Credentials (email + password)
- **Session:** JWT (no DB round-trip per request — `id` and `role` embedded in token)
- **Password:** bcrypt (12 rounds)
- **Role-based redirects on login:**
  - Admin → `/admin/payments`
  - Professor → `/`
  - Student → `/dashboard`
- **Route protection:** Server-side `auth()` checks in layouts; client-side `RoleGuard` component

---

## Dev Credentials (seed data)

| Role      | Email                        | Password                   |
|-----------|------------------------------|----------------------------|
| Admin     | admin@intellonotes.ma        | Admin@IntelloNotes2024!    |
| Professor | prof.ahmed@intellonotes.ma   | Prof@IntelloNotes2024!     |
| Student   | student@intellonotes.ma      | Student@IntelloNotes2024!  |

Reset dev database: `npm run db:reset`

---

## Project Constraints & Business Rules

- Course prices must be one of: **49, 56, 68, 78 Dh** (no digit 9)
- Commission split must always use `commission.ts` — never hardcode 0.7/0.3
- PDF uploads capped at **20 MB**, stored in `storage/course-pdfs/`, served via protected API route
- Axis progression is **strictly sequential** — cannot skip axes
- Purchase state machine: `pending` → `confirmed` | `rejected` only
- Serverless (e.g. Vercel) requires swapping better-sqlite3 for `@libsql/client` (Turso)
