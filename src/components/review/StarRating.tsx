"use client";

import { useState } from "react";

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
    sm: "text-base",
    md: "text-2xl",
    lg: "text-3xl",
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
              className={`${sizeMap[size]} ${
                readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
              } transition-all duration-150 ${
                isFilled ? "text-yellow-500" : "text-gray-300"
              }`}
              aria-label={`${value} star${value !== 1 ? "s" : ""}`}
            >
              {isFilled ? "★" : "☆"}
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
