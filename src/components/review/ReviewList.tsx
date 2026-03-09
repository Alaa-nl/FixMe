"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import StarRating from "./StarRating";
import ReviewCard from "./ReviewCard";

interface ReviewListProps {
  userId: string;
}

interface ReviewData {
  reviews: any[];
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function ReviewList({ userId }: ReviewListProps) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?userId=${userId}`);
      if (res.ok) {
        const reviewData = await res.json();
        setData(reviewData);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.totalReviews === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-600">No reviews yet.</p>
      </div>
    );
  }

  const maxCount = Math.max(...Object.values(data.distribution));

  return (
    <div className="space-y-6">
      {/* Average Rating Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl font-bold text-gray-800">
            {data.averageRating.toFixed(1)}
          </div>
          <div>
            <StarRating
              rating={data.averageRating}
              size="md"
              readOnly
              showNumeric={false}
            />
            <p className="text-sm text-gray-600 mt-1">
              Based on {data.totalReviews} review{data.totalReviews !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = data.distribution[stars as keyof typeof data.distribution];
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-sm font-medium text-gray-700 w-12">
                  {stars} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {data.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
