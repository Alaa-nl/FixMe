import { timeAgo } from "@/lib/utils";
import StarRating from "./StarRating";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string | Date;
    reviewer: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
    job?: {
      repairRequest: {
        title: string;
      };
    };
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  // Handle missing reviewer data
  if (!review.reviewer) {
    return (
      <div className="bg-white rounded-lg border-b border-gray-200 last:border-0 p-4">
        <p className="text-gray-500 text-sm">Review data not available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border-b border-gray-200 last:border-0 p-4">
      {/* Top Row: Avatar + Name + Date */}
      <div className="flex items-start gap-3 mb-3">
        {review.reviewer?.avatarUrl ? (
          <img
            src={review.reviewer.avatarUrl}
            alt={review.reviewer?.name || "User"}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
            {review.reviewer?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-800">{review.reviewer?.name || "Unknown"}</p>
            <p className="text-xs text-gray-500">{timeAgo(review.createdAt)}</p>
          </div>

          {/* Star Rating */}
          <div className="mt-1">
            <StarRating rating={review.rating} size="sm" readOnly showNumeric={false} />
          </div>
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
      )}

      {/* Job Title */}
      {review.job?.repairRequest && (
        <p className="text-xs text-gray-500">
          For: {review.job.repairRequest.title}
        </p>
      )}
    </div>
  );
}
