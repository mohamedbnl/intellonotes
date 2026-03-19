# IntelloNotes — Project Planning Prompt for Claude Code

You are going to help me plan, architect, and build **IntelloNotes**, a full-stack e-learning marketplace built for Moroccan university students who want to learn programming languages at affordable prices (49 to 78 Dh per course). The platform connects students with professors through a commission-based model where professors earn 70% of every sale and the platform retains 30%.

## Project context and requirements

The platform serves three user roles: **students** (browse, purchase, and learn), **professors** (publish courses and earn commissions), and **admins** (review courses, manage payments, and oversee users).

### Tech stack

- **Frontend:** Next.js (App Router) with TypeScript and Tailwind CSS, deployed on Vercel (free tier).
- **Backend/Database/Auth/Storage:** Supabase (free tier) — PostgreSQL database, built-in authentication with role-based access (student/professor/admin), file storage for course PDFs, and real-time subscriptions for instant purchase unlocking.
- **Code playground:** Monaco Editor (the VS Code engine) embedded in the browser for syntax highlighting and auto-complete, with Pyodide for in-browser Python execution and native JavaScript execution — no server-side compilation needed.
- **PDF viewer:** react-pdf to render course PDFs directly in the browser.
- **Hosting:** Vercel (free) for the app, Supabase (free) for everything else. Zero hosting cost at launch.

### Core feature: the 5-axis pedagogical structure

Every course on the platform must follow a mandatory 5-axis progression. This is enforced at two levels — through the professor's guided submission wizard and through admin review before publication:

- **Axe 1 — Introduction:** Learning objectives, prerequisites, and an intro quiz or self-assessment question to engage the student from the start.
- **Axe 2 — Theory:** Core concepts explained with clear definitions, concrete examples, analogies, and mandatory visuals/diagrams. Followed by a mini-QCM (2-3 questions) to verify immediate comprehension.
- **Axe 3 — Practice:** A hands-on exercise or tutorial with a step-by-step walkthrough demonstrating methodology and reasoning, followed by a graded practice test with a detailed answer key.
- **Axe 4 — Synthesis:** A half-page maximum summary (bullet points or mind map) of the essential takeaways, followed by a quick true/false or fill-in-the-blank memory quiz.
- **Axe 5 — Final evaluation:** A comprehensive assessment of 10 to 15 questions minimum, mixing QCM, true/false, and application exercises. Students must score at least 70% to complete the course. Ends with a teaser sentence for the next lesson.

Students progress through axes sequentially — each axis quiz must be passed before the next unlocks.

### Student experience

- **Course catalog (homepage):** Grid of course cards with search bar and filter chips by programming language (Python, JavaScript, C, Java, HTML/CSS, SQL) and level (beginner, intermediate). Each card shows title, language badge, professor name, price, and rating.
- **Course detail page:** Title, description, 2-3 learning objectives, prerequisites, 5-axis table of contents, professor bio, and price with a "buy now" button. Axe 1 intro content is shown for free as a teaser — everything else is locked behind purchase.
- **Purchase flow:** Student clicks "buy," selects CashPlus or bank transfer, gets payment instructions, pays externally, then clicks "I've paid" on the platform. This creates a pending purchase. Admin confirms manually, and the course unlocks instantly via Supabase real-time subscription.
- **Learning interface:** Two-panel layout — course content on the left (PDF rendered in browser + exercises) and a progress sidebar on the right showing axis completion status (filled green = completed, amber = in progress, gray = locked). The code playground (Monaco + Pyodide) sits alongside lessons so students can code, run, and test directly in the browser when exercises require it.
- **Quiz engine:** Supports three question types — QCM (multiple choice), true/false, and fill-in-the-blank. Questions stored as JSON. Client-side instant feedback (green/red with correct answer shown). Scores saved to progress table.
- **Student dashboard:** Purchased courses with progress bars ("Axe 3/5"), a prominent "continue learning" button for the last active course, and a link to browse more courses.
- **Mobile-first design:** Lazy-loading PDF pages for slower connections, thumb-friendly quiz interfaces, responsive layout adapting from desktop to mobile.

### Professor experience

- **Onboarding:** Sign up with email/password (Supabase Auth), fill a profile (name, bio, expertise area, optional photo). Role stored as "professor" in users table. Must digitally sign the quality charter (timestamped checkbox confirming original authorship) before first submission.
- **Course creation — 5-axis guided wizard:** A multi-step form that walks the professor through each axis. Each step requires specific fields and cannot be skipped. The professor uploads a PDF and fills in metadata, sets a price (49-78 Dh, avoiding the digit 9 in pricing), and creates all quizzes through the form.
- **Professor dashboard:** Total earnings and withdrawable balance, total sales count, unique enrolled students, list of courses with status badges (draft, pending review, approved/live, rejected with admin feedback), "create new course" button, sales history with per-course breakdown, and withdrawal request button.
- **Withdrawals:** Minimum 100 Dh threshold. Professor clicks "withdraw," admin processes via bank transfer or CashPlus within 48 hours. Manual at launch.

### Admin experience

- **Course review queue:** List of pending submissions (FIFO). Review interface with two panels — course content preview on the left, quality charter checklist on the right. Checklist items: PDF is native text (not scanned image), file under 20 Mo, readable fonts (12pt+), all 5 axes present with their quizzes, Axe 5 has 10-15 questions minimum, no plagiarism, no external payment links, charter signed. Admin can approve (course goes live) or reject (must provide specific written feedback).
- **Payment confirmations:** Pending payments list. Admin checks CashPlus app or bank account, clicks "confirm" to unlock course for student, or "reject" if payment not found. Purchase status: pending → confirmed or rejected.
- **Financial dashboard:** Four KPI cards — total revenue, platform share (30%), amount owed to professors (70% not yet withdrawn), total sales count. Withdrawal requests queue (pending/processed/rejected). Transaction log with full breakdown (date, student, course, amount, professor share, platform share, status) and CSV export.
- **User management:** Searchable student and professor lists. Ability to deactivate student accounts or suspend professor accounts (suspending auto-hides all their live courses; students who already purchased retain access).
- **Course management:** Master table of all courses with status filters (all/pending/approved/rejected/suspended). Click into any course to preview or change status.
- **Platform stats:** Total registered users (students vs professors), new signups this week/month, total courses published, revenue this week/month, top 5 best-selling courses, most active professors.

### Database schema (PostgreSQL via Supabase)

- **users:** id, name, email, role (student/professor/admin), bio, expertise, avatar_url, created_at
- **courses:** id, professor_id (FK → users), title, description, language, level, price, status (draft/pending/approved/rejected/suspended), pdf_url, created_at
- **lessons:** id, course_id (FK → courses), axis_number (1-5), title, content, display_order
- **quizzes:** id, lesson_id (FK → lessons), axis_number, questions (JSON array), passing_score
- **purchases:** id, student_id (FK → users), course_id (FK → courses), amount_paid, professor_commission, platform_commission, status (pending/confirmed/rejected), purchased_at
- **progress:** id, student_id (FK → users), course_id (FK → courses), current_axis, quiz_scores (JSON), is_completed, last_accessed_at

Row Level Security (RLS) policies: students see only their own purchases and progress, professors manage only their own courses and see their own earnings, admins access everything.

### Pricing and commission model

- Courses priced between 49-78 Dh (avoid the digit 9 — use distinctive prices like 49, 56, 68, 78 Dh).
- 70% goes to the professor, 30% to the platform, calculated automatically on each confirmed purchase.
- Payment methods: CashPlus and bank transfer (manual confirmation at launch).

## What I need you to do

1. **Analyze this project** and create a comprehensive development plan with a clear file/folder structure for the Next.js app.
2. **Set up the project** with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase integration.
3. **Design and implement the database** — create all Supabase tables, relationships, and RLS policies.
4. **Build features incrementally** starting with the core: authentication with role-based routing, then the course catalog, then the course detail/purchase flow, then the learning interface (PDF viewer + code playground + quiz engine), then the professor dashboard and course creation wizard, then the admin panel.
5. **Ensure mobile-first responsive design** throughout.
6. **Ask me questions** if anything is ambiguous before making assumptions.

Start by giving me the project plan and folder structure, then we'll build it together step by step.
