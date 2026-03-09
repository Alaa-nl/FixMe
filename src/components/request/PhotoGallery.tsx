"use client";

import { useState } from "react";
import Image from "next/image";
import { CategoryIcon } from "@/lib/categoryIconsReact";
import { Package } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
  categorySlug?: string;
}

export default function PhotoGallery({ photos, categorySlug }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // If no photos, show category emoji placeholder
  if (photos.length === 0) {
    return (
      <div className="w-full aspect-video bg-orange-50/50 rounded-xl flex items-center justify-center">
        {categorySlug ? (
          <CategoryIcon slug={categorySlug} className="w-20 h-20 text-primary/30" />
        ) : (
          <Package className="w-20 h-20 text-primary/30" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Photo */}
      <div className="relative w-full aspect-video bg-gray-200 rounded-xl overflow-hidden">
        <Image
          src={photos[selectedIndex]}
          alt={`Photo ${selectedIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
          priority
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
              <Image
                src={photo}
                alt={`Thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
