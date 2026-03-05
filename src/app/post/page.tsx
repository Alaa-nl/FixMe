"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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

export default function PostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form data
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
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
      setError("Maximum 5 photos allowed");
      return;
    }

    // Convert files to base64
    const base64Photos: string[] = [];
    for (const file of newFiles) {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;
      base64Photos.push(base64);
    }

    setPhotos([...photos, ...base64Photos]);
    setPhotoFiles([...photoFiles, ...newFiles]);
    setError("");
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  // Trigger AI diagnosis
  const triggerDiagnosis = async () => {
    if (photos.length === 0) return;

    setIsAnalyzing(true);
    setError("");

    try {
      const res = await fetch("/api/ai-diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images: photos,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze photos");
      }

      const diagnosisData = await res.json();
      setDiagnosis(diagnosisData);
    } catch (err) {
      console.error("Error during AI diagnosis:", err);
      setError("Failed to analyze photos. Please continue manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Move to next step
  const handleNextStep = () => {
    if (step === 1) {
      if (photos.length === 0) {
        setError("Please upload at least one photo");
        return;
      }
      // Trigger AI diagnosis
      if (!diagnosis && !isAnalyzing) {
        triggerDiagnosis();
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedCategoryId) {
        setError("Please select a category");
        return;
      }
      setStep(3);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }

    if (!city.trim()) {
      setError("Please enter your city");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      console.log("🚀 Submitting repair request...");

      // For now, we're using base64 encoded photos directly
      // In production, you would upload to cloud storage (S3, Cloudinary, etc.)
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          categoryId: selectedCategoryId,
          photos: photos, // base64 encoded photos
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
        throw new Error(errorData.error || "Failed to submit request");
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
          : "Failed to submit request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Post a repair request
          </h1>
          <p className="text-gray-600">
            Tell us what's broken and we'll connect you with local fixers
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
            <span>Photos</span>
            <span>Category</span>
            <span>Details</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: Photos */}
        {step === 1 && (
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Upload photos of your broken item
            </h2>
            <p className="text-gray-600 mb-6">
              Add up to 5 photos. Our AI will analyze them to help diagnose the
              problem.
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
                    ✕
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {photos.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-orange-50 transition-colors">
                  <span className="text-4xl mb-2">📸</span>
                  <span className="text-sm text-gray-600">Add photo</span>
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
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Select a category
            </h2>
            {diagnosis && (
              <p className="text-sm text-gray-600 mb-6">
                ✨ AI suggestion: We think this is{" "}
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
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleNextStep}
                disabled={!selectedCategoryId}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-6 md:p-8 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add details
            </h2>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken bike chain"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what's broken and any other important details..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              ></textarea>
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Click on the map or search for your address
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
                  Or enter manually
                </summary>
                <div className="mt-3 space-y-3">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City (e.g. Amsterdam)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </details>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                When do you need it fixed? *
              </label>
              <div className="space-y-2">
                {[
                  { value: "URGENT", label: "Urgent (within 24 hours)" },
                  { value: "THIS_WEEK", label: "This week" },
                  { value: "NO_RUSH", label: "No rush" },
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
                How will the repair happen? *
              </label>
              <div className="space-y-2">
                {[
                  {
                    value: "BRING_TO_FIXER",
                    label: "I'll bring it to the fixer",
                  },
                  {
                    value: "FIXER_COMES_TO_ME",
                    label: "Fixer comes to my location",
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
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Post request"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
