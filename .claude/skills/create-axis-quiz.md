# Skill: Create a quiz for a course axis

## When to use

Use this skill whenever you need to create, modify, or seed quiz data for any of the 5 course axes in IntelloNotes. This covers: building quiz JSON structures, inserting quizzes into the database, creating quiz UI components, and grading logic.

## Quiz data structure

Quizzes are stored in the `quizzes` table as a JSONB `questions` array. Every question object follows one of three types:

```typescript
// src/types/quiz.ts

type QuestionType = "mcq" | "true_false" | "fill_blank";

interface MCQQuestion {
  id: string;                    // Unique within the quiz, e.g. "q1", "q2"
  type: "mcq";
  text: string;                  // The question (in French by default)
  text_ar?: string;              // Optional Arabic translation
  options: string[];             // 3-4 choices
  options_ar?: string[];         // Arabic translations of options
  correct_index: number;         // Index of correct option (0-based)
  explanation?: string;          // Shown after answering
}

interface TrueFalseQuestion {
  id: string;
  type: "true_false";
  text: string;
  text_ar?: string;
  correct_answer: boolean;       // true or false
  explanation?: string;
}

interface FillBlankQuestion {
  id: string;
  type: "fill_blank";
  text: string;                  // Use {{BLANK}} as placeholder, e.g. "The keyword to define a function in Python is {{BLANK}}"
  text_ar?: string;
  correct_answers: string[];     // Accept multiple valid answers, e.g. ["def", "DEF"]
  case_sensitive: boolean;       // Usually false
  explanation?: string;
}

type QuizQuestion = MCQQuestion | TrueFalseQuestion | FillBlankQuestion;
```

## Quiz rules per axis

Each axis has different quiz requirements. Always follow this table:

| Axis | Quiz purpose | Question count | Required types | Passing score |
|------|-------------|----------------|----------------|---------------|
| Axe 1: Introduction | Self-assessment / engagement | 1-2 | Any (usually 1 MCQ) | No minimum (completion only) |
| Axe 2: Theory | Comprehension check | 2-3 | MCQ only | No minimum (completion only) |
| Axe 3: Practice | Application test | 2-4 | MCQ + fill_blank | No minimum (completion only) |
| Axe 4: Synthesis | Memory recall | 2-3 | true_false + fill_blank | No minimum (completion only) |
| Axe 5: Final evaluation | Course completion gate | 10-15 | Mix of ALL three types | **70% minimum to pass** |

**Critical rules:**
- Axes 1-4: all questions must be answered, but there is no minimum score — the student just needs to complete the quiz to unlock the next axis
- Axe 5: the student MUST score ≥ 70% or they cannot complete the course — they can retry unlimited times
- Axe 5 MUST contain at least 10 questions and MUST include all three question types (mcq, true_false, fill_blank)

## Database insertion pattern

### Insert via Supabase migration (for seed data)

```sql
-- supabase/migrations/00009_seed_quiz_example.sql

INSERT INTO quizzes (lesson_id, axis_number, questions, passing_score)
VALUES (
  (SELECT id FROM lessons WHERE course_id = 'COURSE_UUID' AND axis_number = 1 LIMIT 1),
  1,
  '[
    {
      "id": "q1",
      "type": "mcq",
      "text": "Quel mot-clé est utilisé pour déclarer une variable en JavaScript ?",
      "options": ["var", "int", "string", "dim"],
      "correct_index": 0,
      "explanation": "En JavaScript, var, let et const sont utilisés pour déclarer des variables."
    }
  ]'::jsonb,
  0  -- No minimum for Axis 1
);
```

### Insert via application code (professor wizard)

```typescript
// Inside the course creation wizard step for quiz creation

import { createBrowserClient } from "@/lib/supabase/client";

async function saveQuiz(
  lessonId: string,
  axisNumber: number,
  questions: QuizQuestion[]
): Promise<void> {
  const supabase = createBrowserClient();

  // Validate before saving
  validateQuizForAxis(axisNumber, questions);

  const passingScore = axisNumber === 5 ? 70 : 0;

  const { error } = await supabase.from("quizzes").upsert({
    lesson_id: lessonId,
    axis_number: axisNumber,
    questions: questions as unknown as Json,
    passing_score: passingScore,
  });

  if (error) throw new Error(`Failed to save quiz: ${error.message}`);
}
```

## Validation function

Always validate quiz data before saving. This runs both in the professor wizard (client-side) and in admin review checks.

```typescript
// src/lib/utils/quiz-validator.ts

import type { QuizQuestion } from "@/types/quiz";

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateQuizForAxis(
  axisNumber: number,
  questions: QuizQuestion[]
): ValidationResult {
  const errors: string[] = [];

  // General checks
  if (questions.length === 0) {
    errors.push("Quiz must have at least one question.");
  }

  // Check all questions have unique IDs
  const ids = questions.map((q) => q.id);
  if (new Set(ids).size !== ids.length) {
    errors.push("All question IDs must be unique.");
  }

  // Check each question has non-empty text
  for (const q of questions) {
    if (!q.text || q.text.trim().length === 0) {
      errors.push(`Question ${q.id} has empty text.`);
    }
  }

  // MCQ-specific: validate options and correct_index
  for (const q of questions) {
    if (q.type === "mcq") {
      if (!q.options || q.options.length < 2) {
        errors.push(`MCQ ${q.id} must have at least 2 options.`);
      }
      if (q.correct_index < 0 || q.correct_index >= (q.options?.length ?? 0)) {
        errors.push(`MCQ ${q.id} has invalid correct_index.`);
      }
    }
  }

  // Fill-blank specific: check correct_answers is non-empty
  for (const q of questions) {
    if (q.type === "fill_blank") {
      if (!q.correct_answers || q.correct_answers.length === 0) {
        errors.push(`Fill-blank ${q.id} must have at least one correct answer.`);
      }
      if (!q.text.includes("{{BLANK}}")) {
        errors.push(`Fill-blank ${q.id} text must contain {{BLANK}} placeholder.`);
      }
    }
  }

  // Axis-specific checks
  switch (axisNumber) {
    case 1:
      if (questions.length > 2) {
        errors.push("Axis 1 quiz should have 1-2 questions maximum.");
      }
      break;

    case 2:
      if (questions.length < 2 || questions.length > 3) {
        errors.push("Axis 2 quiz should have 2-3 questions.");
      }
      if (!questions.every((q) => q.type === "mcq")) {
        errors.push("Axis 2 quiz should contain MCQ questions only.");
      }
      break;

    case 3:
      if (questions.length < 2 || questions.length > 4) {
        errors.push("Axis 3 quiz should have 2-4 questions.");
      }
      break;

    case 4:
      if (questions.length < 2 || questions.length > 3) {
        errors.push("Axis 4 quiz should have 2-3 questions.");
      }
      break;

    case 5:
      if (questions.length < 10) {
        errors.push(`Axis 5 requires minimum 10 questions (found ${questions.length}).`);
      }
      if (questions.length > 15) {
        errors.push("Axis 5 should not exceed 15 questions.");
      }
      const types = new Set(questions.map((q) => q.type));
      if (!types.has("mcq")) errors.push("Axis 5 must include MCQ questions.");
      if (!types.has("true_false")) errors.push("Axis 5 must include true/false questions.");
      if (!types.has("fill_blank")) errors.push("Axis 5 must include fill-in-the-blank questions.");
      break;
  }

  return { valid: errors.length === 0, errors };
}
```

## Grading function

Client-side grading after the student submits answers.

```typescript
// src/lib/utils/quiz-grader.ts

import type { QuizQuestion } from "@/types/quiz";

interface StudentAnswer {
  questionId: string;
  answer: number | boolean | string; // MCQ → index, T/F → boolean, fill → string
}

interface GradingResult {
  score: number;           // Percentage (0-100)
  correct: number;
  total: number;
  passed: boolean;
  details: {
    questionId: string;
    correct: boolean;
    correctAnswer: string; // Human-readable correct answer for feedback
  }[];
}

export function gradeQuiz(
  questions: QuizQuestion[],
  answers: StudentAnswer[],
  passingScore: number = 0
): GradingResult {
  const details = questions.map((q) => {
    const studentAnswer = answers.find((a) => a.questionId === q.id);

    if (!studentAnswer) {
      return { questionId: q.id, correct: false, correctAnswer: getCorrectAnswer(q) };
    }

    let isCorrect = false;

    switch (q.type) {
      case "mcq":
        isCorrect = studentAnswer.answer === q.correct_index;
        break;
      case "true_false":
        isCorrect = studentAnswer.answer === q.correct_answer;
        break;
      case "fill_blank": {
        const studentText = String(studentAnswer.answer).trim();
        isCorrect = q.correct_answers.some((valid) =>
          q.case_sensitive
            ? studentText === valid.trim()
            : studentText.toLowerCase() === valid.trim().toLowerCase()
        );
        break;
      }
    }

    return { questionId: q.id, correct: isCorrect, correctAnswer: getCorrectAnswer(q) };
  });

  const correct = details.filter((d) => d.correct).length;
  const total = questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    score,
    correct,
    total,
    passed: score >= passingScore,
    details,
  };
}

function getCorrectAnswer(q: QuizQuestion): string {
  switch (q.type) {
    case "mcq":
      return q.options[q.correct_index];
    case "true_false":
      return q.correct_answer ? "Vrai" : "Faux";
    case "fill_blank":
      return q.correct_answers[0];
  }
}
```

## Saving progress after grading

After grading, update the `progress` table so the student's axis unlocks.

```typescript
// Inside the QuizEngine component, after grading

async function submitQuizResults(
  studentId: string,
  courseId: string,
  axisNumber: number,
  result: GradingResult
): Promise<void> {
  const supabase = createBrowserClient();

  // Get current progress
  const { data: progress } = await supabase
    .from("progress")
    .select("*")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .single();

  if (!progress) throw new Error("Progress record not found");

  // Update quiz scores (merge with existing)
  const updatedScores = {
    ...(progress.quiz_scores as Record<string, number>),
    [`axis_${axisNumber}`]: result.score,
  };

  // Determine if axis is passed and student can advance
  const canAdvance = axisNumber < 5
    ? true                          // Axes 1-4: completion is enough
    : result.passed;                // Axis 5: must meet 70% threshold

  const newCurrentAxis = canAdvance
    ? Math.min(axisNumber + 1, 5)
    : axisNumber;                   // Stay on same axis if failed

  const isCompleted = axisNumber === 5 && result.passed;

  const { error } = await supabase
    .from("progress")
    .update({
      quiz_scores: updatedScores,
      current_axis: Math.max(progress.current_axis, newCurrentAxis),
      is_completed: isCompleted || progress.is_completed,
      last_accessed_at: new Date().toISOString(),
    })
    .eq("id", progress.id);

  if (error) throw new Error(`Failed to save progress: ${error.message}`);
}
```

## QuizEngine component structure

When building or modifying the QuizEngine component, follow this structure:

```
src/components/learning/
├── QuizEngine.tsx          # Main wrapper — loads quiz, manages state, handles submission
├── QuizQuestion.tsx        # Renders a single question based on type (mcq/true_false/fill_blank)
├── QuizResults.tsx         # Shows score, pass/fail, per-question feedback, retry button
├── MCQOption.tsx           # Radio button option for MCQ questions
├── TrueFalseToggle.tsx     # Two-button toggle for true/false
└── FillBlankInput.tsx      # Text input with {{BLANK}} rendered inline in the question text
```

**QuizEngine state machine:**

```
idle → in_progress → submitted → showing_results
                                      ↓
                                (if failed Axis 5)
                                      ↓
                                   retrying → in_progress → ...
```

**Key behaviors:**
- Show one question at a time with a progress indicator ("Question 3/10")
- The student cannot skip questions — "Next" is disabled until they select/type an answer
- After submitting all answers, grade client-side and show results immediately
- For Axes 1-4: always show "Continue to next axis" button after results (regardless of score)
- For Axis 5: show "Retry" button if score < 70%, show "Course complete!" if passed
- On retry, shuffle question order but keep the same questions
- Store answers in React state (`useState`) during the quiz — only persist to DB after submission

## Example: seeding a complete Axis 5 quiz (Python basics)

```sql
-- Example final evaluation for a Python basics course

INSERT INTO quizzes (lesson_id, axis_number, questions, passing_score)
VALUES (
  (SELECT id FROM lessons WHERE course_id = 'PYTHON_COURSE_UUID' AND axis_number = 5 LIMIT 1),
  5,
  '[
    {"id":"q1","type":"mcq","text":"Quel est le type de la valeur 3.14 en Python ?","options":["int","float","str","bool"],"correct_index":1,"explanation":"3.14 est un nombre décimal, donc de type float."},
    {"id":"q2","type":"mcq","text":"Quelle fonction affiche du texte dans la console ?","options":["echo()","console.log()","print()","write()"],"correct_index":2,"explanation":"En Python, print() affiche du texte dans la console."},
    {"id":"q3","type":"true_false","text":"En Python, les listes sont immuables.","correct_answer":false,"explanation":"Les listes sont mutables. Les tuples sont immuables."},
    {"id":"q4","type":"true_false","text":"Python utilise l indentation pour définir les blocs de code.","correct_answer":true,"explanation":"Contrairement à d autres langages qui utilisent des accolades, Python utilise l indentation."},
    {"id":"q5","type":"fill_blank","text":"Le mot-clé pour définir une fonction en Python est {{BLANK}}.","correct_answers":["def"],"case_sensitive":true,"explanation":"On utilise def pour définir une fonction."},
    {"id":"q6","type":"fill_blank","text":"Pour créer une liste vide, on écrit ma_liste = {{BLANK}}.","correct_answers":["[]","list()"],"case_sensitive":false,"explanation":"[] ou list() créent une liste vide."},
    {"id":"q7","type":"mcq","text":"Quel opérateur est utilisé pour la division entière ?","options":["/","//","%","**"],"correct_index":1,"explanation":"// effectue la division entière (floor division)."},
    {"id":"q8","type":"mcq","text":"Comment accéder au dernier élément d une liste L ?","options":["L[0]","L[-1]","L[last]","L.end()"],"correct_index":1,"explanation":"L[-1] retourne le dernier élément d une liste."},
    {"id":"q9","type":"true_false","text":"range(5) génère les nombres de 1 à 5.","correct_answer":false,"explanation":"range(5) génère 0, 1, 2, 3, 4 — il commence à 0 et s arrête avant 5."},
    {"id":"q10","type":"mcq","text":"Quelle structure permet de gérer les exceptions ?","options":["if/else","for/while","try/except","switch/case"],"correct_index":2,"explanation":"try/except permet de capturer et gérer les erreurs."},
    {"id":"q11","type":"fill_blank","text":"Pour importer le module math, on écrit {{BLANK}} math.","correct_answers":["import"],"case_sensitive":true,"explanation":"Le mot-clé import est utilisé pour charger des modules."},
    {"id":"q12","type":"true_false","text":"En Python 3, print est une fonction et nécessite des parenthèses.","correct_answer":true,"explanation":"En Python 3, print() est une fonction. En Python 2, c était un statement."}
  ]'::jsonb,
  70  -- 70% minimum to pass Axis 5
);
```

## Checklist before creating any quiz

- [ ] Question count matches the axis requirements (see table above)
- [ ] Question types match the axis requirements
- [ ] All question IDs are unique within the quiz
- [ ] All MCQ questions have 3-4 options with a valid `correct_index`
- [ ] All fill_blank questions contain `{{BLANK}}` in the text
- [ ] All fill_blank questions have at least one entry in `correct_answers`
- [ ] Axis 5 has all three question types represented
- [ ] Axis 5 has `passing_score: 70`
- [ ] Axes 1-4 have `passing_score: 0`
- [ ] Questions are written in French (with optional `text_ar` for Arabic)
- [ ] Explanations are provided for learning value (optional but recommended)
- [ ] Run `validateQuizForAxis()` before saving