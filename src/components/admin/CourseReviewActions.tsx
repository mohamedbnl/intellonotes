"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { approveCourse, rejectCourse, suspendCourse } from "@/lib/actions/admin";
import type { CourseStatus } from "@/lib/db/queries";

interface CourseReviewActionsProps {
  courseId: string;
  status: CourseStatus;
}

export function CourseReviewActions({ courseId, status }: CourseReviewActionsProps) {
  const t = useTranslations("admin.courses");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setError(null);
    setIsApproving(true);
    const result = await approveCourse(courseId, locale);
    setIsApproving(false);
    if (result.error) {
      setError(t("errors.generic"));
      return;
    }
    router.push("/admin/courses");
  }

  async function handleRejectSubmit() {
    if (!rejectReason.trim()) {
      setRejectError(t("rejectReasonRequired"));
      return;
    }
    setRejectError(null);
    setIsRejecting(true);
    const result = await rejectCourse(courseId, rejectReason, locale);
    setIsRejecting(false);
    if (result.error) {
      setRejectError(t("errors.generic"));
      return;
    }
    setShowRejectModal(false);
    router.push("/admin/courses");
  }

  async function handleSuspendConfirm() {
    setIsSuspending(true);
    const result = await suspendCourse(courseId, locale);
    setIsSuspending(false);
    if (result.error) {
      setError(t("errors.generic"));
      setShowSuspendModal(false);
      return;
    }
    setShowSuspendModal(false);
    router.push("/admin/courses");
  }

  if (status !== "pending" && status !== "approved") {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
        {error && <p className="text-sm text-red-600 w-full">{error}</p>}

        {status === "pending" && (
          <>
            <Button
              onClick={handleApprove}
              isLoading={isApproving}
              disabled={isRejecting}
              className="flex-1"
            >
              {t("approve")}
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowRejectModal(true)}
              disabled={isApproving}
              className="flex-1"
            >
              {t("reject")}
            </Button>
          </>
        )}

        {status === "approved" && (
          <Button
            variant="danger"
            onClick={() => setShowSuspendModal(true)}
            className="flex-1"
          >
            {t("suspend")}
          </Button>
        )}
      </div>

      {/* Reject modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => { setShowRejectModal(false); setRejectReason(""); setRejectError(null); }}
        title={t("reject")}
        closeLabel={tCommon("cancel")}
      >
        <div className="space-y-4">
          <Textarea
            id="reject-reason"
            label={t("rejectReason")}
            placeholder={t("rejectReasonPlaceholder")}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          {rejectError && <p className="text-sm text-red-600">{rejectError}</p>}
          <div className="flex gap-3">
            <Button
              variant="danger"
              className="flex-1"
              isLoading={isRejecting}
              onClick={handleRejectSubmit}
            >
              {t("reject")}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => { setShowRejectModal(false); setRejectReason(""); setRejectError(null); }}
              disabled={isRejecting}
            >
              {tCommon("cancel")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Suspend modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title={t("suspend")}
        closeLabel={tCommon("cancel")}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{t("suspendConfirm")}</p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              className="flex-1"
              isLoading={isSuspending}
              onClick={handleSuspendConfirm}
            >
              {t("suspend")}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowSuspendModal(false)}
              disabled={isSuspending}
            >
              {tCommon("cancel")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
