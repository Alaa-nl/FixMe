"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StarRating from "./StarRating";

interface ReviewFormProps {
  jobId: string;
  reviewedUserName: string;
}

export default function ReviewForm({
  jobId,
  reviewedUserName,
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return "Poor 😞";
      case 2:
        return "Below average 😕";
      case 3:
        return "Average 😐";
      case 4:
        return "Good 😊";
      case 5:
        return "Excellent 🤩";
      default:
        return "Select a rating";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate rating
    if (rating < 1 || rating > 5) {
      setError("Please select a rating");
      return;
    }

    // Validate comment length if provided
    if (comment.trim() && comment.trim().length < 10) {
      setError("Comment must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit review");
      }
    } catch (err) {
      setError("An error occurred while submitting your review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Thank you!</h3>
        <p className="text-gray-600">Your review has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        How was your experience with {reviewedUserName}?
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <StarRating
            rating={rating}
            onChange={setRating}
            size="lg"
            readOnly={false}
            showNumeric={false}
          />
          <p className="text-sm font-medium text-gray-700 mt-2">
            {getRatingLabel(rating)}
          </p>
        </div>

        {/* Comment Textarea */}
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others about your experience (optional, min 10 characters)"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          {comment.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {comment.length} characters
              {comment.length < 10 && comment.length > 0 && (
                <span className="text-red-500 ml-1">
                  (minimum 10 required)
                </span>
              )}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit review"}
        </button>
      </form>
    </div>
  );
}
