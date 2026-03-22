"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { CourseReviewCard } from "./CourseReviewCard";
import type { CourseLanguage, CourseStatus } from "@/lib/db/queries";

interface CourseItem {
  id: string;
  title: string;
  language: CourseLanguage;
  price: number;
  status: CourseStatus;
  updated_at: string;
  professor_name: string;
}

interface CourseReviewQueueProps {
  courses: CourseItem[];
}

type StatusFilter = CourseStatus | "all";

const FILTERS: StatusFilter[] = ["all", "pending", "approved", "rejected", "suspended"];

export function CourseReviewQueue({ courses }: CourseReviewQueueProps) {
  const t = useTranslations("admin.courses");
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("pending");

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  const filtered = activeFilter === "all"
    ? courses
    : courses.filter((c) => c.status === activeFilter);

  return (
    <div className="space-y-6">
      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const count = filter === "all"
            ? courses.length
            : courses.filter((c) => c.status === filter).length;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                activeFilter === filter
                  ? "bg-[var(--color-primary-600)] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {t(filter === "all" ? "all" : filter)} ({count})
            </button>
          );
        })}
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <CourseReviewCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
