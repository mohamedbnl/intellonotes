"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LANGUAGE_COLORS, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";
import { submitForReview, deleteDraftCourse } from "@/lib/actions/course";
import type { CourseLanguage, CourseLevel, CourseStatus } from "@/lib/db/queries";

interface ProfessorCourseCardProps {
  course: {
    id: string;
    title: string;
    language: CourseLanguage;
    level: CourseLevel;
    price: number;
    status: CourseStatus;
    rejection_reason: string | null;
    updated_at: string;
  };
}

const STATUS_STYLE: Record<CourseStatus, string> = {
  draft: "bg-slate-50 text-slate-600 border-slate-200/80 ring-slate-100",
  pending: "bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-100",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-100",
  rejected: "bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-100",
  suspended: "bg-zinc-50 text-zinc-700 border-zinc-200/80 ring-zinc-100",
};

const STATUS_INDICATOR: Record<CourseStatus, string> = {
  draft: "bg-slate-400",
  pending: "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
  suspended: "bg-zinc-500",
};

export function ProfessorCourseCard({ course }: ProfessorCourseCardProps) {
  const t = useTranslations("professor.courses");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(course.updated_at));

  const canEdit = course.status === "draft" || course.status === "rejected";
  const canSubmit = course.status === "draft" || course.status === "rejected";
  const canDelete = course.status === "draft";

  async function handleSubmitForReview() {
    setIsSubmitting(true);
    await submitForReview(course.id, locale);
    setIsSubmitting(false);
  }

  async function handleDelete() {
    setIsDeleting(true);
    await deleteDraftCourse(course.id, locale);
    setIsDeleting(false);
    setShowDeleteModal(false);
  }

  return (
    <>
      <div className="group relative flex flex-col h-full bg-gradient-to-br from-white/95 to-slate-50/80 backdrop-blur-3xl rounded-[32px] border border-white/60 max-w-full overflow-hidden transition-all duration-500 ease-out shadow-[0_8px_30px_rgb(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-1.5">
        
        {/* Top Badges Area */}
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-2 flex-wrap">
          <Badge className={`px-2.5 py-1 text-[10px] uppercase font-black tracking-wider shadow-sm border border-black/5 whitespace-nowrap ${LANGUAGE_COLORS[course.language]}`}>
            {LANGUAGE_DISPLAY_NAMES[course.language]}
          </Badge>
          
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border shadow-sm ring-2 ring-opacity-20 whitespace-nowrap ${STATUS_STYLE[course.status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_INDICATOR[course.status]}`}></span>
            <span className="truncate">{t(`status.${course.status}`)}</span>
          </div>
        </div>

        {/* Title Area */}
        <div className="px-6 flex-1 flex flex-col gap-3">
          <h3 className="font-extrabold text-slate-800 text-[1.2rem] leading-snug transition-colors duration-200 group-hover:text-primary-600 mt-1">
            {course.title}
          </h3>

          {/* Rejection reason */}
          {course.status === "rejected" && course.rejection_reason && (
            <div className="bg-rose-50/80 backdrop-blur-sm border border-rose-100 rounded-2xl p-4 shadow-sm relative overflow-hidden mt-2">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-400 rounded-l-2xl"></div>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {t("rejectionReason")}
              </p>
              <p className="text-sm font-medium text-rose-700 leading-relaxed">{course.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Course Meta Area */}
        <div className="px-6 pt-4 pb-6 mt-auto">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent mb-4"></div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-shrink-0 inline-flex items-center justify-center bg-white/80 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,1)] px-4 py-2 rounded-[14px] text-slate-800 font-extrabold text-[15px] whitespace-nowrap">
              {course.price} Dh
            </div>
            <span className="text-slate-400 font-bold text-[11px] tracking-wider uppercase text-right leading-tight max-w-[120px]">
              {t("updated", { date: formattedDate })}
            </span>
          </div>
        </div>

        {/* Footer / Action Area */}
        <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100/80 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          {canEdit && (
            <Link href={`/professor/courses/${course.id}`} className="w-full sm:flex-1">
              <Button variant="secondary" size="sm" className="w-full font-extrabold shadow-sm rounded-xl h-11 border-slate-200/80 hover:bg-white transition-all text-slate-600 hover:text-slate-900 focus:ring-2 focus:ring-slate-200">
                {t("actions.edit")}
              </Button>
            </Link>
          )}
          {canSubmit && (
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:flex-1 font-extrabold shadow-[0_4px_12px_rgba(var(--color-primary-500),0.2)] rounded-xl h-11 btn-3d focus:ring-2 focus:ring-primary-500/50"
              isLoading={isSubmitting}
              onClick={handleSubmitForReview}
            >
              {course.status === "rejected"
                ? t("actions.resubmit")
                : t("actions.submitForReview")}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              className="font-bold shadow-sm rounded-xl h-11 w-full sm:w-auto px-4 opacity-85 hover:opacity-100 transition-opacity focus:ring-2 focus:ring-rose-200"
              onClick={() => setShowDeleteModal(true)}
              aria-label={t("actions.delete")}
            >
              <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          )}
          
          {/* Status-specific Footer Indicators */}
          {course.status === "pending" && (
            <div className="flex items-center justify-center w-full py-3 px-4 bg-amber-50/80 border border-amber-200/50 rounded-xl shadow-sm">
              <span className="relative flex h-2.5 w-2.5 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-amber-500"></span>
              </span>
              <p className="text-[12px] text-amber-700 font-extrabold uppercase tracking-widest">
                {t("actions.underReview")}
              </p>
            </div>
          )}
          {course.status === "approved" && (
            <div className="flex items-center justify-center w-full py-3 px-4 bg-emerald-50/80 border border-emerald-200/50 rounded-xl shadow-sm">
              <span className="relative flex h-2.5 w-2.5 mr-3">
                <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
              </span>
              <p className="text-[12px] text-emerald-700 font-extrabold uppercase tracking-widest">
                {t("actions.published")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("actions.delete")}
        closeLabel={tCommon("close")}
      >
        <p className="text-sm text-gray-600 mb-6">{t("deleteConfirm")}</p>
        <div className="flex gap-3">
          <Button
            variant="danger"
            className="flex-1 rounded-xl font-bold"
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            {t("deleteConfirmAction")}
          </Button>
          <Button
            variant="secondary"
            className="flex-1 rounded-xl font-bold"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            {tCommon("cancel")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
