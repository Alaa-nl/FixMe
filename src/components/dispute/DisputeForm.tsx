"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";

interface DisputeFormProps {
  jobId: string;
}

const COMMON_REASONS = [
  "Work not completed as agreed",
  "Poor quality of work",
  "Fixer didn't show up",
  "Item damaged during repair",
  "Other issue",
];

export default function DisputeForm({ jobId }: DisputeFormProps) {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div id="dispute-section" className="bg-white rounded-xl border-t-4 border-red-500 p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        ⚠️ Open a dispute
      </h2>
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
              <span className="text-gray-700">📷 Add photos</span>
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
              a dispute will put the payment on hold. The fixer will have 48 hours to respond.
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !confirmed}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "Submitting dispute..." : "Submit dispute"}
        </Button>
      </form>
    </div>
  );
}
