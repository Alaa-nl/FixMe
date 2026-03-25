"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Camera, X, ImagePlus, Video } from "lucide-react";
import Button from "@/components/ui/button";
import DiagnosisLoading from "@/components/ai/DiagnosisLoading";
import DiagnosisCard from "@/components/ai/DiagnosisCard";
import { DiagnosisResult } from "@/lib/claude";

// Dynamically import LocationPicker with SSR disabled
const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] md:h-[400px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Loading map...</span>
    </div>
  ),
});

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostClientProps {
  content: Record<string, string>;
}

export default function PostClient({ content }: PostClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form data
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [locationLat, setLocationLat] = useState(52.3676);
  const [locationLng, setLocationLng] = useState(4.9041);
  const [timeline, setTimeline] = useState<"URGENT" | "THIS_WEEK" | "NO_RUSH">("THIS_WEEK");
  const [mobility, setMobility] = useState<"BRING_TO_FIXER" | "FIXER_COMES_TO_ME">("BRING_TO_FIXER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/post");
    }
  }, [status, router]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Auto-select category when diagnosis comes back
  useEffect(() => {
    if (diagnosis && diagnosis.categorySuggestion && categories.length > 0) {
      const suggestedCategory = categories.find(
        (cat) => cat.slug === diagnosis.categorySuggestion
      );
      if (suggestedCategory) {
        setSelectedCategoryId(suggestedCategory.id);
      }
    }
  }, [diagnosis, categories]);

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalPhotos = photos.length + newFiles.length;

    if (totalPhotos > 5) {
      setError(content["post_error_max_photos"]);
      return;
    }

    // Create object URLs for previews (faster than base64, no memory bloat)
    const previewUrls = newFiles.map((file) => URL.createObjectURL(file));

    setPhotos([...photos, ...previewUrls]);
    setPhotoFiles([...photoFiles, ...newFiles]);
    setError("");
  };

  // Remove photo
  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photos[index]);
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  // Handle video upload (1 video max)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError("Video must be under 50MB");
      return;
    }

    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError("");
  };

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview("");
  };

  // Convert File to base64 (used only for AI diagnosis)
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  // Trigger AI diagnosis
  const triggerDiagnosis = async () => {
    if (photoFiles.length === 0) return;

    setIsAnalyzing(true);
    setError("");

    try {
      // Convert files to base64 on-demand for the AI endpoint
      const base64Images = await Promise.all(photoFiles.map(fileToBase64));

      const res = await fetch("/api/ai-diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: base64Images,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze photos");
      }

      const diagnosisData = await res.json();
      setDiagnosis(diagnosisData);
    } catch (err) {
      console.error("Error during AI diagnosis:", err);
      setError(content["post_error_ai"]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Move to next step
  const handleNextStep = () => {
    if (step === 1) {
      if (photoFiles.length === 0) {
        setError(content["post_error_no_photos"]);
        return;
      }
      // Trigger AI diagnosis
      if (!diagnosis && !isAnalyzing) {
        triggerDiagnosis();
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedCategoryId) {
        setError(content["post_error_no_category"]);
        return;
      }
      setStep(3);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError(content["post_error_no_title"]);
      return;
    }

    if (!description.trim()) {
      setError(content["post_error_no_desc"]);
      return;
    }

    if (!city.trim()) {
      setError(content["post_error_no_city"]);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Upload photos to Supabase Storage first
      const uploadedUrls: string[] = [];
      for (const file of photoFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "repair-media");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) {
          throw new Error("Failed to upload photo");
        }
        const uploadData = await uploadRes.json();
        uploadedUrls.push(uploadData.url);
      }

      // Upload video directly to Supabase (bypasses Vercel 4.5MB limit)
      let videoUrl: string | undefined;
      if (videoFile) {
        // Step 1: Get a signed upload URL from our API
        const signedRes = await fetch("/api/upload/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileType: videoFile.type,
            fileSize: videoFile.size,
            bucket: "repair-media",
          }),
        });
        if (!signedRes.ok) {
          const errData = await signedRes.json();
          throw new Error(errData.error || "Failed to prepare video upload");
        }
        const { signedUrl, publicUrl } = await signedRes.json();

        // Step 2: Upload the video directly to Supabase Storage
        const directUpload = await fetch(signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": videoFile.type,
            "x-upsert": "false",
          },
          body: videoFile,
        });
        if (!directUpload.ok) {
          throw new Error("Failed to upload video");
        }
        videoUrl = publicUrl;
      }

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          categoryId: selectedCategoryId,
          photos: uploadedUrls,
          videoUrl,
          city,
          address,
          locationLat,
          locationLng,
          timeline,
          mobility,
          aiDiagnosis: diagnosis,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || content["post_error_submit"]);
      }

      const createdRequest = await res.json();
      console.log("✅ Request created:", createdRequest.id);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Error submitting request:", err);
      setError(
        err instanceof Error
          ? err.message
          : content["post_error_submit"]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">{content["post_loading"]}</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-display">
            {content["post_title"]}
          </h1>
          <p className="text-gray-500">
            {content["post_subtitle"]}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNum
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > stepNum ? "bg-primary" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{content["post_step1_label"]}</span>
            <span>{content["post_step2_label"]}</span>
            <span>{content["post_step3_label"]}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Photos */}
        {step === 1 && (
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {content["post_step1_heading"]}
            </h2>
            <p className="text-gray-600 mb-6">
              {content["post_step1_desc"]}
            </p>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {photos.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-orange-50 transition-colors">
                  <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">{content["post_photo_add"]}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Video Upload (optional, 1 max) */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Video className="w-4 h-4" />
                Video (optional, 1 max, 50MB)
              </p>
              {videoPreview ? (
                <div className="relative inline-block">
                  <video
                    src={videoPreview}
                    className="h-32 rounded-lg border-2 border-gray-200"
                    controls
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-orange-50 transition-colors">
                  <Video className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Add a video</span>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* AI Diagnosis Section */}
            {photos.length > 0 && (
              <div className="mt-6">
                {isAnalyzing && <DiagnosisLoading />}
                {diagnosis && !isAnalyzing && (
                  <DiagnosisCard diagnosis={diagnosis} userType={session?.user?.userType} />
                )}
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end mt-6">
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextStep}
                disabled={photos.length === 0}
              >
                {content["post_continue_button"]}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {content["post_step2_heading"]}
            </h2>
            {diagnosis && (
              <p className="text-sm text-gray-600 mb-6">
                {content["post_ai_suggestion"]}{" "}
                <span className="font-semibold text-primary">
                  {categories.find((c) => c.id === selectedCategoryId)?.name}
                </span>
              </p>
            )}

            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedCategoryId === category.id
                      ? "border-primary bg-orange-50"
                      : "border-gray-200 hover:border-primary"
                  }`}
                >
                  <p className="font-semibold text-gray-800">{category.name}</p>
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                {content["post_back_button"]}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextStep}
                disabled={!selectedCategoryId}
              >
                {content["post_continue_button"]}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {content["post_step3_heading"]}
            </h2>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {content["post_field_title_label"]}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={content["post_field_title_placeholder"]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {content["post_field_desc_label"]}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={content["post_field_desc_placeholder"]}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              ></textarea>
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {content["post_field_location_label"]}
              </label>
              <p className="text-sm text-gray-600 mb-3">
                {content["post_field_location_hint"]}
              </p>
              <LocationPicker
                onLocationSelect={(location) => {
                  setCity(location.city);
                  setAddress(location.address);
                  setLocationLat(location.lat);
                  setLocationLng(location.lng);
                }}
                initialLat={locationLat}
                initialLng={locationLng}
                initialAddress={address}
              />
              {/* Fallback text input */}
              <details className="mt-3">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                  {content["post_location_manual"]}
                </summary>
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={content["post_city_placeholder"]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={content["post_address_placeholder"]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </details>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {content["post_timeline_label"]}
              </label>
              <div className="space-y-2">
                {[
                  { value: "URGENT", label: content["post_timeline_urgent"] },
                  { value: "THIS_WEEK", label: content["post_timeline_week"] },
                  { value: "NO_RUSH", label: content["post_timeline_no_rush"] },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="timeline"
                      value={option.value}
                      checked={timeline === option.value}
                      onChange={(e) =>
                        setTimeline(
                          e.target.value as "URGENT" | "THIS_WEEK" | "NO_RUSH"
                        )
                      }
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mobility */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {content["post_mobility_label"]}
              </label>
              <div className="space-y-2">
                {[
                  {
                    value: "BRING_TO_FIXER",
                    label: content["post_mobility_bring"],
                  },
                  {
                    value: "FIXER_COMES_TO_ME",
                    label: content["post_mobility_comes"],
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="mobility"
                      value={option.value}
                      checked={mobility === option.value}
                      onChange={(e) =>
                        setMobility(
                          e.target.value as
                            | "BRING_TO_FIXER"
                            | "FIXER_COMES_TO_ME"
                        )
                      }
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(2)}>
                {content["post_back_button"]}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? content["post_submitting"] : content["post_submit_button"]}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
