"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle } from "lucide-react";

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  // Fixer-specific state
  const [kvkNumber, setKvkNumber] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(10);
  const [minJobFee, setMinJobFee] = useState(10);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchUserData();
      fetchCategories();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setName(data.user.name || "");
        setEmail(data.user.email || "");
        setPhone(data.user.phone || "");
        setCity(data.user.city || "");
        setAvatarUrl(data.user.avatarUrl || "");
        setAvatarPreview(data.user.avatarUrl || "");

        if (data.user.userType === "FIXER" && data.user.fixerProfile) {
          const profile = data.user.fixerProfile;
          setKvkNumber(profile.kvkNumber || "");
          setBio(profile.bio || "");
          setSkills(profile.skills || []);
          setServiceRadiusKm(profile.serviceRadiusKm || 10);
          setMinJobFee(profile.minJobFee || 10);
          setIsActive(profile.isActive ?? true);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.url);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  const toggleSkill = (slug: string) => {
    setSkills((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const updateData: any = {
        name,
        phone,
        city,
        avatarUrl,
      };

      if (user?.userType === "FIXER") {
        updateData.kvkNumber = kvkNumber;
        updateData.bio = bio;
        updateData.skills = skills;
        updateData.serviceRadiusKm = serviceRadiusKm;
        updateData.minJobFee = minJobFee;
        updateData.isActive = isActive;
      }

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-orange-600 transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-600 mt-3">Change photo</p>
          </div>

          {/* Common Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Contact support to change email
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+31 6 12345678"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Amsterdam"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fixer-Only Fields */}
          {user?.userType === "FIXER" && (
            <div className="pt-6 border-t space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Fixer Profile</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KVK Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={kvkNumber}
                    onChange={(e) => setKvkNumber(e.target.value)}
                    placeholder="12345678"
                    readOnly={user?.fixerProfile?.kvkVerified}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      user?.fixerProfile?.kvkVerified
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                  />
                  {user?.fixerProfile?.kvkVerified && (
                    <div className="absolute right-3 top-2.5 flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                  )}
                </div>
                {!user?.fixerProfile?.kvkVerified && kvkNumber && (
                  <p className="text-xs text-yellow-600 mt-1">Pending verification</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell customers about yourself, your experience, and what you can fix."
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bio.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills / Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => toggleSkill(category.slug)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        skills.includes(category.slug)
                          ? "bg-primary text-white"
                          : "border border-gray-300 text-gray-700 hover:border-primary"
                      }`}
                    >
                      {category.emoji} {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service area: {serviceRadiusKm} km
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum job fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-600">€</span>
                  <input
                    type="number"
                    value={minJobFee}
                    onChange={(e) => setMinJobFee(Number(e.target.value))}
                    placeholder="10"
                    min="0"
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  You won&apos;t see requests below this amount
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Available for jobs</p>
                  <p className="text-xs text-gray-500">
                    Turn off to hide from search results
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-11 h-6 rounded-full peer transition-colors ${
                      isActive ? "bg-green-500" : "bg-gray-300"
                    } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white`}
                  ></div>
                </label>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes("success")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
