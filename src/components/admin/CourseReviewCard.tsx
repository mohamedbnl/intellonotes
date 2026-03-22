"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LANGUAGE_COLORS, LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";
import { approveCourse } from "@/lib/actions/admin";
import type { CourseLanguage, CourseStatus } from "@/lib/db/queries";

interface CourseReviewCardProps {
  course: {
    id: string;
    title: string;
    language: CourseLanguage;
    price: number;
    status: CourseStatus;
    updated_at: string;
    professor_name: string;
  };
}

const STATUS_COLORS: Record<CourseStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-gray-200 text-gray-700",
};

export function CourseReviewCard({ course }: CourseReviewCardProps) {
  const t = useTranslations("admin.courses");
  const locale = useLocale();
  const [isApproving, setIsApproving] = useState(false);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(course.updated_at));

  async function handleQuickApprove() {
    setIsApproving(true);
    await approveCourse(course.id, locale);
    setIsApproving(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
      {/* Badges */}
      <div className="flex items-center justify-between gap-2">
        <Badge className={LANGUAGE_COLORS[course.language]}>
          {LANGUAGE_DISPLAY_NAMES[course.language]}
        </Badge>
        <Badge className={STATUS_COLORS[course.status]}>
          {t(`status.${course.status}`)}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2">
        {course.title}
      </h3>

      {/* Professor + price */}
      <div className="text-sm text-gray-500 space-y-1">
        <p>{t("professor")}: <span className="text-gray-700 font-medium">{course.professor_name}</span></p>
        <p className="font-bold text-gray-900">{course.price} Dh</p>
      </div>

      {/* Date */}
      <p className="text-xs text-gray-400">{t("updatedAt", { date: formattedDate })}</p>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link href={`/admin/courses/${course.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            {t("reviewCourse")}
          </Button>
        </Link>
        {course.status === "pending" && (
          <Button
            size="sm"
            variant="primary"
            isLoading={isApproving}
            onClick={handleQuickApprove}
            className="flex-1"
          >
            {t("approve")}
          </Button>
        )}
      </div>
    </div>
  );
}
