# Skill: Create a new component

## When to use

Use this skill every time you create a new React component in IntelloNotes — whether it's a UI primitive, a form, a data display card, or a complex interactive widget.

## File location and naming

```
src/components/
├── ui/          # Reusable primitives (Button, Card, Badge, Input, Modal, Spinner, Skeleton)
├── layout/      # App shell (Header, Footer, MobileNav, Sidebar)
├── auth/        # Auth forms (LoginForm, RegisterForm, RoleGuard)
├── courses/     # Course browsing (CourseCard, CourseGrid, SearchBar, FilterChips, PurchaseButton)
├── learning/    # Learning interface (PDFViewer, ProgressSidebar, QuizEngine, CodePlayground)
├── professor/   # Professor features (CourseWizard, AxisStepForm, ProfessorDashboard)
├── dashboard/   # Student dashboard (PurchasedCourseCard, ProgressBar)
└── admin/       # Admin panel (ReviewQueue, ReviewChecklist, PaymentConfirmCard)
```

**Naming rules:**
- File: kebab-case → `course-card.tsx`
- Component: PascalCase → `CourseCard`
- One component per file (with small internal helpers allowed)
- Co-locate types in the same file if they're only used there; otherwise put them in `src/types/`

## Server component template (default)

Use this for components that only display data and don't need interactivity:

```tsx
// src/components/courses/course-card.tsx

import { cn } from "@/lib/utils/cn";

interface CourseCardProps {
  title: string;
  language: string;
  professorName: string;
  price: number;
  rating?: number;
  className?: string;
}

export function CourseCard({
  title,
  language,
  professorName,
  price,
  rating,
  className,
}: CourseCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md",
        className
      )}
    >
      <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
        {language}
      </span>
      <h3 className="mt-3 text-lg font-semibold text-start">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 text-start">{professorName}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-bold text-teal-600">{price} Dh</span>
        {rating && (
          <span className="text-sm text-amber-500">{rating.toFixed(1)}/5</span>
        )}
      </div>
    </div>
  );
}
```

## Client component template

Use `"use client"` ONLY when the component needs: hooks, event handlers, browser APIs, or state.

```tsx
// src/components/courses/search-bar.tsx

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({ placeholder = "Rechercher...", className }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 ps-10 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
      />
    </form>
  );
}
```

## Form component template (for professor wizard steps)

The professor course wizard has 5 steps (one per axis). Each step is a separate form component:

```tsx
// src/components/professor/axis-step-form.tsx

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

// Step-specific data shape
interface AxisOneData {
  title: string;
  description: string;
  prerequisites: string;
  objectives: string[];
  introQuiz: QuizQuestion[];
}

interface AxisStepFormProps {
  axisNumber: number;
  initialData?: Partial<AxisOneData>;
  onSubmit: (data: AxisOneData) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export function AxisOneForm({
  initialData,
  onSubmit,
  onBack,
  isLoading = false,
}: AxisStepFormProps) {
  const t = useTranslations("CourseWizard");

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [prerequisites, setPrerequisites] = useState(initialData?.prerequisites ?? "");
  const [objectives, setObjectives] = useState<string[]>(
    initialData?.objectives ?? ["", "", ""]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = t("errors.titleRequired");
    if (title.trim().length < 5) newErrors.title = t("errors.titleTooShort");
    if (!description.trim()) newErrors.description = t("errors.descriptionRequired");
    if (!prerequisites.trim()) newErrors.prerequisites = t("errors.prerequisitesRequired");

    const filledObjectives = objectives.filter((o) => o.trim());
    if (filledObjectives.length < 2) {
      newErrors.objectives = t("errors.minTwoObjectives");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      prerequisites: prerequisites.trim(),
      objectives: objectives.filter((o) => o.trim()),
      introQuiz: [], // Quiz added in a sub-step
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-xl font-bold text-start">
        {t("axis1.title")}
      </h2>
      <p className="mt-1 text-sm text-gray-500 text-start">
        {t("axis1.description")}
      </p>

      <div className="mt-6 space-y-5">
        {/* Course title */}
        <div>
          <label className="block text-sm font-medium text-start">
            {t("fields.courseTitle")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm",
              errors.title ? "border-red-500" : "border-gray-300"
            )}
            placeholder={t("fields.courseTitlePlaceholder")}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-start">
            {t("fields.description")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={cn(
              "mt-1 w-full rounded-lg border px-3 py-2 text-sm",
              errors.description ? "border-red-500" : "border-gray-300"
            )}
            placeholder={t("fields.descriptionPlaceholder")}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Objectives (dynamic list) */}
        <div>
          <label className="block text-sm font-medium text-start">
            {t("fields.objectives")}
          </label>
          <p className="text-xs text-gray-400 text-start">
            {t("fields.objectivesHint")}
          </p>
          {objectives.map((obj, i) => (
            <div key={i} className="mt-2 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-400">{i + 1}.</span>
              <input
                type="text"
                value={obj}
                onChange={(e) => {
                  const updated = [...objectives];
                  updated[i] = e.target.value;
                  setObjectives(updated);
                }}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder={t("fields.objectivePlaceholder", { n: i + 1 })}
              />
            </div>
          ))}
          {errors.objectives && (
            <p className="mt-1 text-xs text-red-500">{errors.objectives}</p>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
            >
              {t("buttons.back")}
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="ms-auto rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? t("buttons.saving") : t("buttons.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Multi-step wizard wrapper

The course wizard manages which step is active and collects data across all 5 steps:

```tsx
// src/components/professor/course-wizard.tsx

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface WizardState {
  currentStep: number;  // 1-5
  axis1Data: AxisOneData | null;
  axis2Data: AxisTwoData | null;
  axis3Data: AxisThreeData | null;
  axis4Data: AxisFourData | null;
  axis5Data: AxisFiveData | null;
}

export function CourseWizard() {
  const t = useTranslations("CourseWizard");
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    axis1Data: null,
    axis2Data: null,
    axis3Data: null,
    axis4Data: null,
    axis5Data: null,
  });

  // Step indicator
  const steps = [
    { number: 1, label: t("steps.introduction") },
    { number: 2, label: t("steps.theory") },
    { number: 3, label: t("steps.practice") },
    { number: 4, label: t("steps.synthesis") },
    { number: 5, label: t("steps.evaluation") },
  ];

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((step) => (
          <div key={step.number} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                state.currentStep === step.number
                  ? "bg-purple-600 text-white"
                  : state.currentStep > step.number
                    ? "bg-teal-500 text-white"
                    : "bg-gray-200 text-gray-500"
              )}
            >
              {state.currentStep > step.number ? "✓" : step.number}
            </div>
            {step.number < 5 && (
              <div
                className={cn(
                  "h-0.5 w-8",
                  state.currentStep > step.number ? "bg-teal-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Render current step form */}
      {state.currentStep === 1 && (
        <AxisOneForm
          initialData={state.axis1Data ?? undefined}
          onSubmit={(data) =>
            setState((s) => ({ ...s, axis1Data: data, currentStep: 2 }))
          }
        />
      )}
      {/* ... repeat for steps 2-5 */}
    </div>
  );
}
```

## Heavy client component (needs dynamic import)

For components using Monaco, react-pdf, or Pyodide — ALWAYS dynamically import:

```tsx
// src/components/learning/code-playground.tsx

"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePyodide } from "@/hooks/usePyodide";

// Dynamic import — Monaco is ~2MB
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-gray-200" />,
});

interface CodePlaygroundProps {
  language: "python" | "javascript" | "c" | "java" | "sql";
  initialCode?: string;
}

export function CodePlayground({ language, initialCode = "" }: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const { runPython, isLoading: pyLoading } = usePyodide();

  const canExecute = language === "python" || language === "javascript";

  const handleRun = useCallback(async () => {
    if (language === "python") {
      const result = await runPython(code);
      setOutput(result);
    } else if (language === "javascript") {
      try {
        const logs: string[] = [];
        const mockConsole = { log: (...args: unknown[]) => logs.push(args.join(" ")) };
        const fn = new Function("console", code);
        fn(mockConsole);
        setOutput(logs.join("\n"));
      } catch (err) {
        setOutput(`Error: ${(err as Error).message}`);
      }
    }
  }, [code, language, runPython]);

  return (
    <div className="flex flex-col rounded-lg border border-gray-200">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">{language.toUpperCase()}</span>
        <button
          onClick={handleRun}
          disabled={!canExecute || pyLoading}
          className="rounded bg-teal-600 px-3 py-1 text-xs font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pyLoading ? "Chargement..." : canExecute ? "Exécuter" : "Lecture seule"}
        </button>
      </div>

      <MonacoEditor
        height="300px"
        language={language}
        value={code}
        onChange={(val) => setCode(val ?? "")}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />

      {output && (
        <div className="border-t bg-gray-50 p-3">
          <pre className="whitespace-pre-wrap font-mono text-sm text-start">{output}</pre>
        </div>
      )}
    </div>
  );
}
```

## RTL-safe component rules

Every component MUST use logical properties. Quick reference:

```tsx
// WRONG — breaks in Arabic
<div className="ml-4 mr-2 pl-6 text-left border-l-2" />

// CORRECT — works in both LTR and RTL
<div className="ms-4 me-2 ps-6 text-start border-s-2" />
```

## Checklist before creating any component

- [ ] File uses kebab-case, component uses PascalCase
- [ ] Props interface is explicitly typed (no `any`)
- [ ] `className` prop accepted and merged with `cn()` for overrides
- [ ] `"use client"` added ONLY if component needs hooks/events/browser APIs
- [ ] Heavy imports (Monaco, react-pdf, Pyodide) use `next/dynamic` with `ssr: false`
- [ ] Loading skeleton provided for dynamic imports
- [ ] All margin/padding uses logical properties (`ms-`/`me-`/`ps-`/`pe-`)
- [ ] All text alignment uses `text-start`/`text-end` (never `text-left`/`text-right`)
- [ ] Responsive: works on mobile (stacks), tablet (2-col), desktop (3-col) where applicable
- [ ] Translation keys used via `useTranslations()` — no hardcoded French/Arabic strings
