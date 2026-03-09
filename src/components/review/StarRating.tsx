"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  showNumeric?: boolean;
}

export default function StarRating({
  rating,
  onChange,
  size = "md",
  readOnly = false,
  showNumeric = true,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const displayRating = hoveredRating !== null ? hoveredRating : rating;

  const handleClick = (value: number) => {
    if (!readOnly && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readOnly) {
      setHoveredRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoveredRating(null);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = value <= displayRating;

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              disabled={readOnly}
              className={`${
                readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
              } transition-all duration-150`}
              aria-label={`${value} star${value !== 1 ? "s" : ""}`}
            >
              <Star
                className={`${sizeMap[size]} ${
                  isFilled ? "text-amber-400 fill-amber-400" : "text-gray-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {readOnly && showNumeric && rating > 0 && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
