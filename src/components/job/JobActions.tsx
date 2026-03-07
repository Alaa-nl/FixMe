"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileDown } from "lucide-react";

interface JobActionsProps {
  job: {
    id: string;
    status: string;
    agreedPrice: number;
    payments?: Array<{
      fixerPayout: number;
    }>;
    reviews: any[];
  };
  currentUserId: string;
  currentUserType: string;
  isCustomer: boolean;
  isFixer: boolean;
}

export default function JobActions({
  job,
  currentUserId,
  currentUserType,
  isCustomer,
  isFixer,
}: JobActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartJob = async () => {
    if (!confirm("Are you ready to start this job?")) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/jobs/${job.id}/start`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to start job");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteJob = async () => {
    const payment = job.payments && job.payments.length > 0 ? job.payments[0] : null;
    const fixerPayout = payment?.fixerPayout || job.agreedPrice * 0.85;
    if (
      !confirm(
        `Please confirm the repair was done properly. The fixer will receive €${fixerPayout.toFixed(2)}.`
      )
    )
      return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/jobs/${job.id}/complete`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to complete job");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelJob = async () => {
    if (!confirm("Are you sure you want to cancel this job?")) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/jobs/${job.id}/cancel`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to cancel job");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const userHasReviewed = job.reviews.some((r: any) => r.reviewerId === currentUserId);

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* CUSTOMER ACTIONS */}
      {isCustomer && (
        <>
          {job.status === "SCHEDULED" && (
            <button
              onClick={handleCancelJob}
              disabled={isLoading}
              className="w-full px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Cancelling..." : "Cancel job"}
            </button>
          )}

          {job.status === "IN_PROGRESS" && (
            <>
              <button
                onClick={handleCompleteJob}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 text-lg"
              >
                {isLoading ? "Processing..." : "✅ Confirm job completed"}
              </button>
              <a
                href="#dispute-section"
                className="block text-center text-sm text-red-600 hover:underline"
              >
                ⚠️ Open dispute
              </a>
            </>
          )}

          {job.status === "COMPLETED" && !userHasReviewed && (
            <Link href={`/jobs/${job.id}/review`}>
              <button className="w-full px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-orange-600 transition-colors">
                ⭐ Leave a review
              </button>
            </Link>
          )}

          {job.status === "COMPLETED" && userHasReviewed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-medium">✓ You left a review</p>
            </div>
          )}
        </>
      )}

      {/* FIXER ACTIONS */}
      {isFixer && (
        <>
          {job.status === "SCHEDULED" && (
            <>
              <button
                onClick={handleStartJob}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 text-lg"
              >
                {isLoading ? "Starting..." : "🔧 Start job"}
              </button>
              <button
                onClick={handleCancelJob}
                disabled={isLoading}
                className="w-full px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Cancelling..." : "Cancel"}
              </button>
            </>
          )}

          {job.status === "IN_PROGRESS" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm text-center">
                Waiting for customer to confirm completion
              </p>
            </div>
          )}

          {job.status === "COMPLETED" && !userHasReviewed && (
            <Link href={`/jobs/${job.id}/review`}>
              <button className="w-full px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-orange-600 transition-colors">
                ⭐ Leave a review for customer
              </button>
            </Link>
          )}

          {job.status === "COMPLETED" && userHasReviewed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-medium">✓ You left a review</p>
            </div>
          )}
        </>
      )}

      {/* DOWNLOAD INVOICE — both parties, completed jobs */}
      {job.status === "COMPLETED" && (
        <button
          onClick={() => window.open(`/api/jobs/${job.id}/invoice`, "_blank")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:border-primary hover:text-primary transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Download invoice
        </button>
      )}
    </div>
  );
}
