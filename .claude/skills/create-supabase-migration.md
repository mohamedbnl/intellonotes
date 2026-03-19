# Skill: Create a Supabase migration

## When to use

Use this skill every time you need to create a new table, modify a column, add an index, create a trigger, or update RLS policies in the IntelloNotes database.

## Migration file location and naming

All migrations live in `supabase/migrations/` with sequential numbering:

```
supabase/migrations/
├── 00001_create_users.sql
├── 00002_create_courses.sql
├── 00003_create_lessons.sql
├── 00004_create_quizzes.sql
├── 00005_create_purchases.sql
├── 00006_create_progress.sql
├── 00007_create_withdrawals.sql
├── 00008_rls_policies.sql
└── 00009_your_new_migration.sql    # Next one you create
```

**Naming convention:** `{number}_{description_in_snake_case}.sql`

Find the next number by checking the last file:

```powershell
# PowerShell (Windows)
Get-ChildItem supabase\migrations | Sort-Object Name | Select-Object -Last 1
```

```bash
# Bash (Mac/Linux)
ls supabase/migrations/ | sort | tail -1
```

## Create table template

Every new table must have: an `id` primary key, timestamps, RLS enabled, and appropriate policies.

```sql
-- supabase/migrations/00009_create_example.sql

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.example (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create indexes for frequent queries
CREATE INDEX idx_example_user_id ON public.example(user_id);
CREATE INDEX idx_example_status ON public.example(status);

-- 3. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.example
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 4. Enable RLS
ALTER TABLE public.example ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies
CREATE POLICY "Users can read own rows"
  ON public.example FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rows"
  ON public.example FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rows"
  ON public.example FOR UPDATE
  USING (auth.uid() = user_id);
```

## RLS policy patterns for IntelloNotes

Each table has different access rules depending on role. Use these patterns:

### Public read, owner write (courses)

```sql
-- Anyone can read approved courses
CREATE POLICY "Public can read approved courses"
  ON public.courses FOR SELECT
  USING (status = 'approved');

-- Professors can read all their own courses (any status)
CREATE POLICY "Professors can read own courses"
  ON public.courses FOR SELECT
  USING (auth.uid() = professor_id);

-- Professors can insert their own courses
CREATE POLICY "Professors can insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (auth.uid() = professor_id);

-- Professors can update their own draft/rejected courses
CREATE POLICY "Professors can update own courses"
  ON public.courses FOR UPDATE
  USING (auth.uid() = professor_id AND status IN ('draft', 'rejected'));
```

### Owner-only read/write (purchases, progress)

```sql
-- Students can only see their own purchases
CREATE POLICY "Students read own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = student_id);

-- Students can create purchases for themselves
CREATE POLICY "Students create own purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (auth.uid() = student_id);
```

### Admin full access (all tables)

```sql
-- Admin can do everything on courses
CREATE POLICY "Admin full access to courses"
  ON public.courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Read access gated by purchase (lessons, quizzes)

```sql
-- Students can read lessons only if they purchased the course
CREATE POLICY "Purchased students can read lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE student_id = auth.uid()
        AND course_id = lessons.course_id
        AND status = 'confirmed'
    )
  );

-- Professors can read their own course lessons
CREATE POLICY "Professors can read own lessons"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = lessons.course_id
        AND professor_id = auth.uid()
    )
  );
```

## Alter table template (adding columns)

```sql
-- supabase/migrations/00010_add_column_to_courses.sql

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add index if the column will be queried often
CREATE INDEX IF NOT EXISTS idx_courses_tags ON public.courses USING GIN(tags);
```

## Database trigger template (auto-create related rows)

Used when creating a user profile automatically after signup:

```sql
-- Auto-create public.users row when auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## After every migration — mandatory steps

Run these commands in order after creating or modifying any migration:

```powershell
# 1. Reset database to apply all migrations from scratch
npx supabase db reset

# 2. Regenerate TypeScript types
npx supabase gen types typescript --local > src/types/database.ts

# 3. Verify the types file was updated
Get-Content src\types\database.ts | Select-Object -First 5
```

**CRITICAL:** Never edit `src/types/database.ts` by hand. It is always auto-generated.

## Seed data template

Seed data goes in `supabase/seed.sql` and runs after all migrations during `db reset`:

```sql
-- supabase/seed.sql

-- Seed admin user (must match an auth.users entry)
-- In local dev, create this user via Supabase dashboard first, then seed the profile:
INSERT INTO public.users (id, email, name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@intellonotes.ma',
  'Admin',
  'admin'
) ON CONFLICT (id) DO NOTHING;

-- Seed a sample professor
INSERT INTO public.users (id, email, name, role, bio, expertise)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'prof@intellonotes.ma',
  'Prof. Ahmed',
  'professor',
  'Enseignant en informatique avec 10 ans d''expérience',
  'Python, JavaScript'
) ON CONFLICT (id) DO NOTHING;

-- Seed a sample course
INSERT INTO public.courses (id, professor_id, title, description, language, level, price, status)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000002',
  'Python pour débutants',
  'Apprenez les bases de Python : variables, boucles, fonctions et plus.',
  'python',
  'beginner',
  56,
  'approved'
) ON CONFLICT (id) DO NOTHING;
```

## IntelloNotes database schema reference

For quick reference when writing migrations:

```
users:        id, email, name, role, bio, expertise, avatar_url, created_at
courses:      id, professor_id(FK), title, description, language, level, price, status, pdf_url, created_at
lessons:      id, course_id(FK), axis_number(1-5), title, content, display_order
quizzes:      id, lesson_id(FK), axis_number, questions(JSONB), passing_score
purchases:    id, student_id(FK), course_id(FK), amount_paid, professor_commission, platform_commission, status, purchased_at
progress:     id, student_id(FK), course_id(FK), current_axis, quiz_scores(JSONB), is_completed, last_accessed_at
withdrawals:  id, professor_id(FK), amount, status, requested_at, processed_at
```

Valid statuses:
- `courses.status`: draft, pending, approved, rejected, suspended
- `purchases.status`: pending, confirmed, rejected
- `withdrawals.status`: pending, processed, rejected
- `users.role`: student, professor, admin

## Checklist before creating any migration

- [ ] File is numbered sequentially (check last migration number)
- [ ] Table has UUID primary key with `gen_random_uuid()`
- [ ] `created_at` and `updated_at` columns included
- [ ] `updated_at` trigger is created
- [ ] RLS is enabled on the table
- [ ] RLS policies cover: student access, professor access, admin access
- [ ] Indexes created for foreign keys and frequently filtered columns
- [ ] CHECK constraints added for status/enum columns
- [ ] Foreign keys use `ON DELETE CASCADE` where appropriate
- [ ] After writing: run `npx supabase db reset`
- [ ] After reset: run `npx supabase gen types typescript --local > src/types/database.ts`
