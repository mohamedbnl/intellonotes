export const SUPPORTED_LANGUAGES = [
  "python",
  "javascript",
  "c",
  "java",
  "html_css",
  "sql",
] as const;

export const COURSE_LEVELS = ["beginner", "intermediate"] as const;

export const AXIS_LABELS: Record<number, string> = {
  1: "Introduction",
  2: "Théorie",
  3: "Pratique",
  4: "Synthèse",
  5: "Évaluation finale",
};

export const AXIS_COUNT = 5;

export const PRICE_OPTIONS = [49, 56, 68, 78] as const;

export const PLATFORM_COMMISSION_RATE = 0.3;
export const PROFESSOR_COMMISSION_RATE = 0.7;

export const MIN_WITHDRAWAL_AMOUNT = 100;

export const AXIS5_PASSING_SCORE = 70;

// Languages that support in-browser execution
export const EXECUTABLE_LANGUAGES = ["python", "javascript"] as const;

export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  c: "C",
  java: "Java",
  html_css: "HTML/CSS",
  sql: "SQL",
};

export const LANGUAGE_COLORS: Record<string, string> = {
  python: "bg-blue-100 text-blue-700",
  javascript: "bg-yellow-100 text-yellow-700",
  c: "bg-gray-100 text-gray-700",
  java: "bg-orange-100 text-orange-700",
  html_css: "bg-red-100 text-red-700",
  sql: "bg-green-100 text-green-700",
};
