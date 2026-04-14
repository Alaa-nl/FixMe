"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface AdminDeleteRequestButtonProps {
  requestId: string;
}

export default function AdminDeleteRequestButton({ requestId }: AdminDeleteRequestButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/repair-requests/${requestId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin/jobs");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete request");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-bold text-gray-800 mb-1">Delete this listing?</p>
        <p className="text-xs text-gray-500 mb-3">
          This will move the request to trash. You can restore it from the admin trash page within 30 days.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {isDeleting ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
      Delete listing (Admin)
    </button>
  );
}
