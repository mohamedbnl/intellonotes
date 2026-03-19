import { describe, it, expect } from "vitest";
import { gradeQuiz } from "../quiz-grader";
import type { QuizQuestion } from "@/types/quiz";

const mcqQuestion: QuizQuestion = {
  id: "q1",
  type: "mcq",
  text: "What is 2+2?",
  options: ["3", "4", "5", "6"],
  correct_index: 1,
};

const trueFalseQuestion: QuizQuestion = {
  id: "q2",
  type: "true_false",
  text: "Python uses indentation.",
  correct_answer: true,
};

const fillBlankQuestion: QuizQuestion = {
  id: "q3",
  type: "fill_blank",
  text: "The keyword to define a function in Python is {{BLANK}}.",
  correct_answers: ["def"],
  case_sensitive: true,
};

describe("gradeQuiz", () => {
  it("grades a perfect MCQ answer", () => {
    const result = gradeQuiz([mcqQuestion], [{ questionId: "q1", answer: 1 }]);
    expect(result.correct).toBe(1);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it("grades a wrong MCQ answer", () => {
    const result = gradeQuiz([mcqQuestion], [{ questionId: "q1", answer: 0 }]);
    expect(result.correct).toBe(0);
    expect(result.score).toBe(0);
  });

  it("grades a true/false question correctly", () => {
    const result = gradeQuiz(
      [trueFalseQuestion],
      [{ questionId: "q2", answer: true }]
    );
    expect(result.correct).toBe(1);
  });

  it("grades a false true/false answer", () => {
    const result = gradeQuiz(
      [trueFalseQuestion],
      [{ questionId: "q2", answer: false }]
    );
    expect(result.correct).toBe(0);
  });

  it("grades fill-in-the-blank correctly (case sensitive)", () => {
    const result = gradeQuiz(
      [fillBlankQuestion],
      [{ questionId: "q3", answer: "def" }]
    );
    expect(result.correct).toBe(1);
  });

  it("fails fill-in-the-blank with wrong case", () => {
    const result = gradeQuiz(
      [fillBlankQuestion],
      [{ questionId: "q3", answer: "DEF" }]
    );
    expect(result.correct).toBe(0);
  });

  it("passes when score meets passing threshold", () => {
    const questions = [mcqQuestion, trueFalseQuestion];
    const answers = [
      { questionId: "q1", answer: 1 }, // correct
      { questionId: "q2", answer: true }, // correct
    ];
    const result = gradeQuiz(questions, answers, 70);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it("fails when score is below passing threshold", () => {
    const questions = [mcqQuestion, trueFalseQuestion];
    const answers = [
      { questionId: "q1", answer: 0 }, // wrong
      { questionId: "q2", answer: true }, // correct
    ];
    const result = gradeQuiz(questions, answers, 70);
    expect(result.score).toBe(50);
    expect(result.passed).toBe(false);
  });

  it("returns correct answer string for MCQ", () => {
    const result = gradeQuiz([mcqQuestion], [{ questionId: "q1", answer: 0 }]);
    expect(result.details[0].correctAnswer).toBe("4");
  });

  it("handles missing answer (unanswered question)", () => {
    const result = gradeQuiz([mcqQuestion], []);
    expect(result.correct).toBe(0);
    expect(result.details[0].correct).toBe(false);
  });
});
