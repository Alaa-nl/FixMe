"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Wrench,
  MapPin,
  User,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string;
}

const STEPS = [
  { id: 1, title: "Skills", icon: Wrench, label: "What do you fix?" },
  { id: 2, title: "Service", icon: MapPin, label: "Your service area" },
  { id: 3, title: "About", icon: User, label: "Tell us about you" },
  { id: 4, title: "Review", icon: CheckCircle, label: "Ready to go" },
];

export default function BecomeFixerPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <BecomeFixerPage />
    </Suspense>
  );
}

function BecomeFixerPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "true";

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [skills, setSkills] = useState<string[]>([]);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(10);
  const [minJobFee, setMinJobFee] = useState<number | "">("");
  const [bio, setBio] = useState("");
  const [kvkNumber, setKvkNumber] = useState("");
  const [btwNumber, setBtwNumber] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/become-fixer");
      return;
    }

    if (status === "authenticated") {
      // Already a fixer with profile? Go to dashboard
      if (session?.user?.userType === "FIXER" && !isSetup) {
        // Check if profile exists
        fetch("/api/users/me")
          .then((res) => res.json())
          .then((data) => {
            if (data.user?.fixerProfile) {
              router.push("/dashboard");
            } else {
              setIsLoading(false);
            }
          });
      } else if (session?.user?.userType === "ADMIN") {
        router.push("/admin");
      } else {
        setIsLoading(false);
      }
      fetchCategories();
    }
  }, [status, session, router, isSetup]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || data || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const toggleSkill = (slug: string) => {
    setSkills((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return skills.length > 0;
      case 2:
        return serviceRadiusKm >= 1 && serviceRadiusKm <= 50;
      case 3:
        return true; // Bio and KVK are optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/users/me/upgrade-to-fixer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills,
          serviceRadiusKm,
          minJobFee: minJobFee === "" ? null : minJobFee,
          bio: bio.trim() || null,
          kvkNumber: kvkNumber.trim() || null,
          btwNumber: btwNumber.trim() || null,
        }),
      });

      if (res.ok) {
        // Force session refresh to pick up new userType
        await updateSession();
        // Brief pause for the success animation
        await new Promise((resolve) => setTimeout(resolve, 1500));
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400 font-medium">Loading...</div>
      </div>
    );
  }

  const headingText = isSetup ? "Complete your fixer profile" : "Become a Fixer";
  const subtitleText = isSetup
    ? "Set up your profile to start receiving repair requests."
    : "Start earning money by fixing things for people in your area.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10 animate-[fadeInUp_0.4s_ease-out]">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            {isSetup ? "Profile setup" : "Upgrade your account"}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-[family-name:var(--font-bricolage)]">
            {headingText}
          </h1>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">{subtitleText}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => {
                  if (s.id < step) setStep(s.id);
                }}
                disabled={s.id > step}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  s.id === step
                    ? "bg-primary text-white shadow-md shadow-orange-200"
                    : s.id < step
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {s.id < step ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <s.icon className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{s.title}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              key={step}
              className="p-6 md:p-8 animate-[fadeIn_0.2s_ease-out]"
            >
              {/* Step 1: Skills */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    What can you fix?
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Select all categories that match your skills. You can change
                    these later.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {categories.map((category) => (
                      <button
                        key={category.slug}
                        type="button"
                        onClick={() => toggleSkill(category.slug)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                          skills.includes(category.slug)
                            ? "border-primary bg-orange-50 text-primary shadow-sm"
                            : "border-gray-100 text-gray-700 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-lg">{category.emoji}</span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                  {skills.length === 0 && (
                    <p className="text-xs text-gray-400 mt-4 text-center">
                      Select at least one category to continue
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: Service Area & Pricing */}
              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      Your service area
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                      How far are you willing to travel for repairs?
                    </p>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Radius</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {serviceRadiusKm}{" "}
                          <span className="text-sm font-normal text-gray-500">km</span>
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={serviceRadiusKm}
                        onChange={(e) =>
                          setServiceRadiusKm(Number(e.target.value))
                        }
                        className="w-full accent-primary h-2 rounded-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>1 km</span>
                        <span>25 km</span>
                        <span>50 km</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum job fee{" "}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-medium">
                        €
                      </span>
                      <input
                        type="number"
                        value={minJobFee}
                        onChange={(e) =>
                          setMinJobFee(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="0"
                        min="0"
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      You won&apos;t see requests below this amount
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Bio & KVK */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      About you
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                      Help customers understand who they&apos;re hiring. Both
                      fields are optional but recommended.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="I've been fixing bikes for 15 years. Specialized in Dutch city bikes and e-bikes. Quick turnaround, fair prices."
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-300"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {bio.length}/500
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      KVK number{" "}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={kvkNumber}
                      onChange={(e) => setKvkNumber(e.target.value)}
                      placeholder="12345678"
                      maxLength={8}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      Your Dutch Chamber of Commerce registration number. Adding
                      this helps build trust with customers.
                    </p>
                    {kvkNumber && !/^\d{8}$/.test(kvkNumber) && (
                      <p className="text-xs text-red-500 mt-1">
                        KVK number must be exactly 8 digits
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BTW number{" "}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={btwNumber}
                      onChange={(e) => setBtwNumber(e.target.value.toUpperCase())}
                      placeholder="NL123456789B01"
                      maxLength={14}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      Your VAT identification number. Required for invoicing
                      completed repairs.
                    </p>
                    {btwNumber && !/^NL\d{9}B\d{2}$/.test(btwNumber) && (
                      <p className="text-xs text-red-500 mt-1">
                        BTW number must be in format NL123456789B01
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Ready to start fixing?
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Review your details before we set up your fixer profile.
                  </p>

                  <div className="space-y-4">
                    {/* Skills summary */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Skills
                        </span>
                        <button
                          onClick={() => setStep(1)}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((slug) => {
                          const cat = categories.find((c) => c.slug === slug);
                          return (
                            <span
                              key={slug}
                              className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-sm"
                            >
                              {cat?.emoji} {cat?.name || slug}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Service details */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Service area
                        </span>
                        <button
                          onClick={() => setStep(2)}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-gray-900">
                        {serviceRadiusKm} km radius
                        {minJobFee !== "" && minJobFee !== null && (
                          <span className="text-gray-500">
                            {" "}
                            · Min fee: €{minJobFee}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* About */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          About
                        </span>
                        <button
                          onClick={() => setStep(3)}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      {bio ? (
                        <p className="text-gray-900 text-sm">{bio}</p>
                      ) : (
                        <p className="text-gray-400 text-sm italic">
                          No bio added yet
                        </p>
                      )}
                      {kvkNumber && (
                        <p className="text-gray-500 text-sm mt-1">
                          KVK: {kvkNumber}
                        </p>
                      )}
                      {btwNumber && (
                        <p className="text-gray-500 text-sm mt-1">
                          BTW: {btwNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </div>

          {/* Navigation */}
          <div className="border-t border-gray-100 px-6 md:px-8 py-4 flex items-center justify-between bg-gray-50/50">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Start fixing
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6 max-w-sm mx-auto">
          You can update all of these settings later from your profile page.
          Your existing customer account stays fully functional.
        </p>
      </div>
    </div>
  );
}
