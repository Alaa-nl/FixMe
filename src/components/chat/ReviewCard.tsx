import { timeAgo } from "@/lib/utils";
import { Star } from "lucide-react";

interface ReviewCardProps {
  metadata: {
    rating: number;
    comment?: string | null;
    reviewerName?: string;
  };
  createdAt: Date | string;
}

export default function ReviewCard({ metadata, createdAt }: ReviewCardProps) {
  return (
    <div className="flex justify-center my-3">
      <div className="w-[75%] max-w-xs bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
        <div className="px-4 pt-3 pb-2">
          <p className="text-xs text-gray-500 mb-1">
            {metadata.reviewerName ?? "Someone"} left a review
          </p>
          <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= metadata.rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          {metadata.comment && (
            <p className="text-sm text-gray-700 italic line-clamp-3">
              &ldquo;{metadata.comment}&rdquo;
            </p>
          )}
        </div>
        <div className="px-4 py-1.5 border-t border-amber-100">
          <span className="text-[10px] text-gray-400">{timeAgo(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
