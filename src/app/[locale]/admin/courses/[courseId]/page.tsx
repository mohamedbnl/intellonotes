import { notFound, redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Link } from "@i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { getAdminCourseDetail, getCourseContentForEditor } from "@/lib/db/queries";
import { CourseReviewActions } from "@/components/admin/CourseReviewActions";
import { QuizPreview } from "@/components/admin/QuizPreview";
import { LANGUAGE_COLORS, LANGUAGE_DISPLAY_NAMES, AXIS_COUNT } from "@/lib/constants";
import type { QuizQuestion } from "@/types/quiz";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.meta" });
  return { title: t("title") };
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-gray-200 text-gray-700",
};

export default async function AdminCourseReviewPage({
  params,
}: {
  params: Promise<{ locale: string; courseId: string }>;
}) {
  const { locale, courseId } = await params;
  setRequestLocale(locale);

  const [t, tCourse, tEditor, session] = await Promise.all([
    getTranslations("admin.courses"),
    getTranslations("course"),
    getTranslations("professor.courseEditor"),
    auth(),
  ]);

  if (!session?.user || session.user.role !== "admin") {
    redirect(`/${locale}/auth/login`);
  }

  const course = getAdminCourseDetail(courseId);
  if (!course) notFound();

  const { lessons, quizzes } = getCourseContentForEditor(courseId);

  // Build axis data array
  const axisData = [];
  for (let axis = 1; axis <= AXIS_COUNT; axis++) {
    const lesson = lessons.find((l) => l.axis_number === axis) ?? null;
    const quiz = lesson
      ? quizzes.find((q) => q.lesson_id === lesson.id) ?? null
      : null;

    let axisName: string;
    try {
      axisName = `${tCourse("axis", { number: axis })} — ${tCourse(`axisNames.${axis}`)}`;
    } catch {
      axisName = `Axe ${axis}`;
    }

    axisData.push({
      axisNumber: axis,
      axisName,
      lesson,
      quiz: quiz ? { questions: quiz.questions as QuizQuestion[] } : null,
    });
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← {t("backToList")}
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 mb-8 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{course.title}</h1>
        <Badge className={STATUS_COLORS[course.status] ?? "bg-gray-100 text-gray-600"}>
          {t(`status.${course.status}`)}
        </Badge>
      </div>

      {/* Rejection reason callout */}
      {course.rejection_reason && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-700 mb-1">{t("rejectionReason")}</p>
          <p className="text-sm text-red-600">{course.rejection_reason}</p>
        </div>
      )}

      {/* Course metadata */}
      <section className="rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">{t("metadata")}</h2>

        <div className="flex flex-wrap gap-2">
          <Badge className={LANGUAGE_COLORS[course.language]}>
            {LANGUAGE_DISPLAY_NAMES[course.language]}
          </Badge>
          <Badge className="bg-gray-100 text-gray-600">
            {tEditor("lessonTitle").replace("Titre de la leçon", "")}
            {course.level}
          </Badge>
          <span className="font-bold text-gray-900">{course.price} Dh</span>
        </div>

        {course.professor && (
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">{t("professor")}: </span>
            {course.professor.name} ({course.professor.email})
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t("description")}</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{course.description}</p>
        </div>

        {(course.objectives as string[]).length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t("objectives")}</p>
            <ul className="list-disc list-inside space-y-0.5">
              {(course.objectives as string[]).map((obj, i) => (
                <li key={i} className="text-sm text-gray-700">{obj}</li>
              ))}
            </ul>
          </div>
        )}

        {(course.prerequisites as string[]).length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t("prerequisites")}</p>
            <ul className="list-disc list-inside space-y-0.5">
              {(course.prerequisites as string[]).map((pre, i) => (
                <li key={i} className="text-sm text-gray-700">{pre}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* PDF */}
      <section className="rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t("pdfSection")}</h2>
        {course.pdf_url ? (
          <a
            href={`/api/pdf/${course.pdf_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-primary-600)] hover:underline"
          >
            {t("pdfPreview")} ↗
          </a>
        ) : (
          <p className="text-sm text-gray-400">{t("noPdf")}</p>
        )}
      </section>

      {/* 5 axes content */}
      <section className="space-y-4 mb-6">
        <h2 className="text-base font-semibold text-gray-900">{t("courseContent")}</h2>

        {axisData.map((axis) => (
          <div key={axis.axisNumber} className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-900">{axis.axisName}</span>
            </div>

            <div className="p-5 space-y-4">
              {axis.lesson ? (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t("lessonTitle")}</p>
                    <p className="text-sm font-medium text-gray-900">{axis.lesson.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t("lessonContent")}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{axis.lesson.content}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">{t("noLesson")}</p>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  {t("quizQuestions")}
                  {axis.quiz && ` (${t("questionCount", { count: axis.quiz.questions.length })})`}
                </p>
                {axis.quiz && axis.quiz.questions.length > 0 ? (
                  <QuizPreview questions={axis.quiz.questions} />
                ) : (
                  <p className="text-sm text-gray-400">{t("noQuiz")}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Actions */}
      <CourseReviewActions courseId={course.id} status={course.status} />
    </main>
  );
}
