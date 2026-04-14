"use client";

import { useState } from "react";
import { timeAgo } from "@/lib/utils";
import { Star, Send, Loader2, CheckCircle } from "lucide-react";

interface ReviewPromptCardProps {
  metadata: {
    jobId?: string;
    customerName?: string;
    fixerName?: string;
    customerId?: string;
    fixerId?: string;
  };
  createdAt: Date | string;
  currentUserId?: string;
  isCustomer?: boolean;
  isFixer?: boolean;
  onAction?: (action: string, data: Record<string, unknown>) => void;
}

const ratingLabels = ["", "Poor", "Below average", "Average", "Good", "Excellent"];

export default function ReviewPromptCard({
  metadata,
  createdAt,
  currentUserId,
  isCustomer = false,
  isFixer = false,
  onAction,
}: ReviewPromptCardProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const displayRating = hoveredRating || rating;

  const handleSubmit = async () => {
    if (rating < 1) {
      setError("Please select a rating");
      return;
    }
    if (comment.trim() && comment.trim().length < 10) {
      setError("Comment must be at least 10 characters");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: metadata.jobId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        // Refresh messages to show the REVIEW_LEFT card the API inserted
        if (onAction) {
          setTimeout(() => onAction("refresh", {}), 500);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to submit review");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine who this user is reviewing
  const revieweeName = isCustomer ? metadata.fixerName : metadata.customerName;

  // Success state
  if (submitted) {
    return (
      <div className="flex justify-center my-4">
        <div className="w-[85%] max-w-sm bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/60 rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-sm font-bold font-display text-emerald-700 mb-1">
              Review submitted!
            </p>
            <div className="flex items-center justify-center gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            {comment.trim() && (
              <p className="text-xs text-gray-500 italic mt-1 line-clamp-2">
                &ldquo;{comment.trim()}&rdquo;
              </p>
            )}
          </div>
          <div className="px-5 py-2 border-t border-emerald-100/50">
            <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase tabular-nums">
              {timeAgo(createdAt)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <div className="w-[88%] max-w-sm bg-gradient-to-br from-amber-50/80 to-white border border-amber-200/60 rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-2 text-center">
          <p className="text-base font-display font-bold text-secondary-800 mb-1">
            How was the repair?
          </p>
          {revieweeName && (
            <p className="text-xs text-gray-500">
              Rate your experience with {revieweeName}
            </p>
          )}
        </div>

        {/* Star rating */}
        <div className="px-5 py-3 flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="cursor-pointer hover:scale-125 transition-all duration-150 p-0.5"
              >
                <Star
                  className={`w-8 h-8 ${
                    value <= displayRating
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          {displayRating > 0 && (
            <p className="text-xs font-semibold text-amber-700">
              {ratingLabels[displayRating]}
            </p>
          )}
        </div>

        {/* Comment input -- only show after rating is selected */}
        {rating > 0 && (
          <div className="px-5 pb-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience (optional, min 10 chars)"
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 resize-none bg-white placeholder:text-gray-400"
            />
            {comment.length > 0 && comment.length < 10 && (
              <p className="text-[11px] text-amber-600 mt-0.5 px-1">
                {10 - comment.length} more characters needed
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-5 pb-2">
            <p className="text-xs text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* Submit */}
        {rating > 0 && (
          <div className="px-5 py-3 border-t border-amber-100/50">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating < 1}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Review
            </button>
          </div>
        )}

        {/* Timestamp */}
        <div className="px-5 py-2 border-t border-amber-50">
          <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase tabular-nums">
            {timeAgo(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
