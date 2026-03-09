"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";

interface DisputeFormProps {
  jobId: string;
  disputeWindowHours?: number;
}

const COMMON_REASONS = [
  "Work not completed as agreed",
  "Poor quality of work",
  "Fixer didn't show up",
  "Item damaged during repair",
  "Other issue",
];

export default function DisputeForm({ jobId, disputeWindowHours = 72 }: DisputeFormProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  // Scroll form into view when opened
  useEffect(() => {
    if (isFormOpen && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [isFormOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      setError("Maximum 5 photos allowed");
      return;
    }

    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);

    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviewUrls([...photoPreviewUrls, ...newPreviewUrls]);
    setError("");
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviewUrls = photoPreviewUrls.filter((_, i) => i !== index);

    // Revoke the URL to free memory
    URL.revokeObjectURL(photoPreviewUrls[index]);

    setPhotos(newPhotos);
    setPhotoPreviewUrls(newPreviewUrls);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setSelectedReason("");
    setDescription("");
    setPhotos([]);
    photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPhotoPreviewUrls([]);
    setConfirmed(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedReason) {
      setError("Please select a reason");
      return;
    }

    if (description.trim().length < 20) {
      setError("Description must be at least 20 characters");
      return;
    }

    if (!confirmed) {
      setError("Please confirm the accuracy of your information");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload photos first
      const evidencePhotos: string[] = [];
      for (const photo of photos) {
        const formData = new FormData();
        formData.append("file", photo);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) {
          throw new Error("Failed to upload evidence photo");
        }
        const uploadData = await uploadRes.json();
        evidencePhotos.push(uploadData.url);
      }

      const response = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          reason: `${selectedReason}: ${description.trim()}`,
          evidencePhotos: evidencePhotos.length > 0 ? evidencePhotos : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit dispute");
      }

      // Clean up preview URLs
      photoPreviewUrls.forEach((url) => URL.revokeObjectURL(url));

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Collapsed state — just the trigger button
  if (!isFormOpen) {
    return (
      <div id="dispute-section" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800">
              Having an issue with this job?
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Try resolving the issue with the fixer through chat first. If that doesn&apos;t work, you can open a formal dispute.
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex-shrink-0 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
          >
            Open dispute
          </button>
        </div>
      </div>
    );
  }

  // Expanded state — full form
  return (
    <div id="dispute-section" ref={formRef} className="bg-white rounded-xl border-t-4 border-red-500 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800">
          Open a dispute
        </h2>
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close dispute form"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="text-gray-600 mb-6">
        Please try to resolve the issue with the fixer through chat first. Disputes
        should only be opened for serious issues that cannot be resolved directly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Reason Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            What went wrong? *
          </label>
          <div className="space-y-2">
            {COMMON_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setSelectedReason(reason)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedReason === reason
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Detailed description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what happened in detail..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[120px]"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {description.length}/20 characters minimum
          </p>
        </div>

        {/* Evidence Photos */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Evidence photos (optional)
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Upload up to 5 photos showing the issue
          </p>

          {/* Photo Previews */}
          {photoPreviewUrls.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {photoPreviewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {photos.length < 5 && (
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="text-gray-700">Add photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Confirmation Checkbox */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">
              I confirm that the information above is accurate and that I have attempted
              to resolve this issue with the fixer directly. I understand that opening
              a dispute will put the payment on hold. The fixer will have {disputeWindowHours} hours to respond.
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !confirmed}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
          >
            {isSubmitting ? "Submitting dispute..." : "Submit dispute"}
          </Button>
        </div>
      </form>
    </div>
  );
}
