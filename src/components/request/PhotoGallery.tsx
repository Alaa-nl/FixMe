"use client";

import { useState } from "react";
import { getCategoryIcon } from "@/lib/categoryIcons";

interface PhotoGalleryProps {
  photos: string[];
  categorySlug?: string;
}

export default function PhotoGallery({ photos, categorySlug }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // If no photos, show category emoji placeholder
  if (photos.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-9xl">{categorySlug ? getCategoryIcon(categorySlug) : "📦"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Photo */}
      <div className="w-full aspect-video bg-gray-200 rounded-xl overflow-hidden">
        <img
          src={photos[selectedIndex]}
          alt={`Photo ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails (only show if more than 1 photo) */}
      {photos.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <img
                src={photo}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
