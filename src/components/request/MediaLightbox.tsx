"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";

interface MediaItem {
  type: "photo" | "video";
  url: string;
}

interface MediaLightboxProps {
  items: MediaItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function MediaLightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: MediaLightboxProps) {
  const current = items[currentIndex];
  const hasMultiple = items.length > 1;

  const goNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, items.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Counter */}
      {hasMultiple && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium">
          {currentIndex + 1} / {items.length}
        </div>
      )}

      {/* Previous button */}
      {hasMultiple && currentIndex > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {hasMultiple && currentIndex < items.length - 1 && (
        <button
          onClick={goNext}
          className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main content */}
      <div className="relative z-[1] w-full h-full flex items-center justify-center p-12 md:p-16">
        {current.type === "photo" ? (
          <Image
            src={current.url}
            alt={`Media ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            unoptimized
            priority
          />
        ) : (
          <video
            key={current.url}
            src={current.url}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg"
            style={{ maxHeight: "calc(100vh - 8rem)" }}
          />
        )}
      </div>

      {/* Thumbnail strip */}
      {hasMultiple && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-sm">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              className={`relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index
                  ? "border-white ring-1 ring-white/50"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {item.type === "photo" ? (
                <Image
                  src={item.url}
                  alt={`Thumb ${index + 1}`}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
