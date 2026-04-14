"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface ViewCounterProps {
  requestId: string;
  initialCount: number;
  size?: "sm" | "md";
}

export default function ViewCounter({ requestId, initialCount, size = "md" }: ViewCounterProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    // Fire-and-forget: record the view
    fetch(`/api/requests/${requestId}/view`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.counted) {
          setCount((c) => c + 1);
        }
      })
      .catch(() => {
        // Silently ignore -- view tracking is non-critical
      });
  }, [requestId]);

  if (size === "sm") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
        <Eye className="w-3 h-3" />
        {count}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-sm text-gray-500">
      <Eye className="w-4 h-4" />
      <span className="font-medium">{count}</span>
      <span className="text-gray-400">views</span>
    </div>
  );
}
