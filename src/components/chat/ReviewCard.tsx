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
    <div className="flex justify-center my-4">
      <div className="w-[78%] max-w-xs bg-gradient-to-br from-amber-50/80 to-white border border-amber-200/60 rounded-2xl overflow-hidden shadow-card">
        <div className="px-5 pt-4 pb-3">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-2">
            {metadata.reviewerName ?? "Someone"} left a review
          </p>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= metadata.rating
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200"
                }`}
              />
            ))}
            <span className="text-sm font-bold text-amber-700 ml-1.5">{metadata.rating}.0</span>
          </div>
          {metadata.comment && (
            <p className="text-sm text-gray-600 leading-relaxed italic line-clamp-3">
              &ldquo;{metadata.comment}&rdquo;
            </p>
          )}
        </div>
        <div className="px-5 py-2 border-t border-amber-100/50">
          <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase tabular-nums">
            {timeAgo(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
