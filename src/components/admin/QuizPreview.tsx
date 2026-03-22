"use client";

import { useTranslations } from "next-intl";
import type { QuizQuestion, MCQQuestion, TrueFalseQuestion, FillBlankQuestion } from "@/types/quiz";
import { cn } from "@/lib/utils/cn";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

function MCQPreview({ question }: { question: MCQQuestion }) {
  const t = useTranslations("professor.courseEditor");
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-800">{question.text || <span className="italic text-gray-400">(no text)</span>}</p>
      <div className="space-y-1">
        {question.options.map((opt, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
              question.correct_index === i
                ? "bg-green-50 text-green-800 font-medium"
                : "bg-gray-50 text-gray-600"
            )}
          >
            <span className="font-mono text-xs">{OPTION_LETTERS[i] ?? i + 1}.</span>
            {opt || <span className="italic text-gray-400">(empty)</span>}
            {question.correct_index === i && (
              <span className="ms-auto text-xs text-green-600">{t("mcqCorrectAnswer")}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TrueFalsePreview({ question }: { question: TrueFalseQuestion }) {
  const t = useTranslations("professor.courseEditor");
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-800">{question.text}</p>
      <div className="flex gap-2">
        {([true, false] as const).map((val) => (
          <span
            key={String(val)}
            className={cn(
              "px-3 py-1 rounded-lg text-sm font-medium",
              question.correct_answer === val
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-50 text-gray-400"
            )}
          >
            {val ? t("trueFalseTrue") : t("trueFalseFalse")}
          </span>
        ))}
      </div>
    </div>
  );
}

function FillBlankPreview({ question }: { question: FillBlankQuestion }) {
  const t = useTranslations("professor.courseEditor");
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-800">{question.text}</p>
      <div className="space-y-1">
        <p className="text-xs text-gray-500">{t("fillBlankAnswer")}:</p>
        {question.correct_answers.map((ans, i) => (
          <span
            key={i}
            className="inline-block me-2 px-2 py-0.5 bg-green-50 text-green-700 rounded text-sm font-mono"
          >
            {ans || "(empty)"}
          </span>
        ))}
      </div>
    </div>
  );
}

interface QuizPreviewProps {
  questions: QuizQuestion[];
}

export function QuizPreview({ questions }: QuizPreviewProps) {
  const t = useTranslations("professor.courseEditor");

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <p className="text-xs font-medium text-gray-400">
            #{i + 1} — {t(`questionTypes.${q.type}`)}
          </p>
          {q.type === "mcq" && <MCQPreview question={q} />}
          {q.type === "true_false" && <TrueFalsePreview question={q} />}
          {q.type === "fill_blank" && <FillBlankPreview question={q} />}
          {q.explanation && (
            <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-2">
              {t("explanation")}: {q.explanation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
