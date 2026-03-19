export type {
  Database,
  UserRole,
  CourseStatus,
  CourseLanguage,
  CourseLevel,
  PurchaseStatus,
  WithdrawalStatus,
  Json,
} from "./database";

export type { QuizQuestion, MCQQuestion, TrueFalseQuestion, FillBlankQuestion } from "./quiz";

// Convenience joined types for common queries
import type { Database } from "./database";

type Tables = Database["public"]["Tables"];

export type User = Tables["users"]["Row"];
export type Course = Tables["courses"]["Row"];
export type Lesson = Tables["lessons"]["Row"];
export type Quiz = Tables["quizzes"]["Row"];
export type Purchase = Tables["purchases"]["Row"];
export type Progress = Tables["progress"]["Row"];
export type Withdrawal = Tables["withdrawals"]["Row"];

export type CourseWithProfessor = Course & {
  users: Pick<User, "name" | "avatar_url" | "bio" | "expertise">;
};

export type PurchaseWithCourse = Purchase & {
  courses: Course;
};

export type ProgressWithCourse = Progress & {
  courses: Course;
};
