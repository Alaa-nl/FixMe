"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { CategoryIcon } from "@/lib/categoryIconsReact";
import { Package, Play, Expand } from "lucide-react";
import MediaLightbox from "./MediaLightbox";

interface MediaItem {
  type: "photo" | "video";
  url: string;
}

interface PhotoGalleryProps {
  photos: string[];
  videoUrl?: string | null;
  categorySlug?: string;
}

export default function PhotoGallery({ photos, videoUrl, categorySlug }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Build unified media list: photos first, then video
  const mediaItems: MediaItem[] = useMemo(() => {
    const items: MediaItem[] = photos.map((url) => ({ type: "photo" as const, url }));
    if (videoUrl) {
      items.push({ type: "video", url: videoUrl });
    }
    return items;
  }, [photos, videoUrl]);

  // No media at all — show placeholder
  if (mediaItems.length === 0) {
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

  const current = mediaItems[selectedIndex];

  return (
    <>
      <div className="space-y-4">
        {/* Main Display */}
        <div
          className="relative w-full aspect-video bg-gray-200 rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          {current.type === "photo" ? (
            <Image
              src={current.url}
              alt={`Photo ${selectedIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
              priority
            />
          ) : (
            <video
              key={current.url}
              src={current.url}
              controls
              className="w-full h-full object-contain bg-black"
              onClick={(e) => {
                // Don't open lightbox when clicking video controls
                e.stopPropagation();
              }}
            />
          )}

          {/* Expand hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none">
            <div className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Expand className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Thumbnails (show if more than 1 item) */}
        {mediaItems.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {mediaItems.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? "border-primary ring-2 ring-primary ring-offset-2"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {item.type === "photo" ? (
                  <Image
                    src={item.url}
                    alt={`Thumbnail ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <MediaLightbox
          items={mediaItems}
          currentIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(index) => setSelectedIndex(index)}
        />
      )}
    </>
  );
}
