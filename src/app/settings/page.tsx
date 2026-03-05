"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Toggle from "@/components/ui/Toggle";
import Modal from "@/components/ui/Modal";
import { ChevronDown, ChevronUp } from "lucide-react";
import PasswordInput from "@/components/ui/password-input";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification preferences (stored in localStorage for now)
  const [emailOffers, setEmailOffers] = useState(true);
  const [emailMessages, setEmailMessages] = useState(false);
  const [emailJobUpdates, setEmailJobUpdates] = useState(true);
  const [emailReviews, setEmailReviews] = useState(true);

  // Privacy preferences (stored in localStorage for now)
  const [showCity, setShowCity] = useState(true);
  const [showPhone, setShowPhone] = useState(true);

  // Language preference
  const [language, setLanguage] = useState("English");

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchUserData();
      loadPreferences();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const loadPreferences = () => {
    // Load from localStorage
    const prefs = localStorage.getItem("notificationPreferences");
    if (prefs) {
      const parsed = JSON.parse(prefs);
      setEmailOffers(parsed.emailOffers ?? true);
      setEmailMessages(parsed.emailMessages ?? false);
      setEmailJobUpdates(parsed.emailJobUpdates ?? true);
      setEmailReviews(parsed.emailReviews ?? true);
    }

    const privacyPrefs = localStorage.getItem("privacyPreferences");
    if (privacyPrefs) {
      const parsed = JSON.parse(privacyPrefs);
      setShowCity(parsed.showCity ?? true);
      setShowPhone(parsed.showPhone ?? true);
    }

    const lang = localStorage.getItem("language");
    if (lang) {
      setLanguage(lang);
    }
  };

  const saveNotificationPreferences = (prefs: any) => {
    localStorage.setItem("notificationPreferences", JSON.stringify(prefs));
  };

  const savePrivacyPreferences = (prefs: any) => {
    localStorage.setItem("privacyPreferences", JSON.stringify(prefs));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch("/api/users/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setShowPasswordChange(false);
          setPasswordMessage("");
        }, 2000);
      } else {
        setPasswordMessage(data.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordMessage("An error occurred. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });

      if (res.ok) {
        // Sign out and redirect to homepage
        await signOut({ redirect: false });
        router.push("/");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const isGoogleAccount = user.provider === "google";
  const isAppleAccount = user.provider === "apple";
  const canChangePassword = !isGoogleAccount && !isAppleAccount && user.passwordHash;

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

        <div className="bg-white rounded-xl shadow-sm border divide-y">
          {/* SECTION: Account */}
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Account</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {canChangePassword && (
              <div>
                <button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="flex items-center gap-2 text-primary font-medium hover:text-orange-600 transition-colors"
                >
                  Change password
                  {showPasswordChange ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showPasswordChange && (
                  <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current password
                      </label>
                      <PasswordInput
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New password
                      </label>
                      <PasswordInput
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm new password
                      </label>
                      <PasswordInput
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    {passwordMessage && (
                      <div
                        className={`p-3 rounded-lg text-sm ${
                          passwordMessage.includes("success")
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {passwordMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword ? "Updating..." : "Update password"}
                    </button>
                  </form>
                )}
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Connected accounts
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white border rounded flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Google</span>
                  </div>
                  {isGoogleAccount ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Connected
                    </span>
                  ) : (
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      Connect
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Apple</span>
                  </div>
                  {isAppleAccount ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      Connected
                    </span>
                  ) : (
                    <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: Notifications */}
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Notifications</h2>

            <div className="space-y-4">
              <Toggle
                label="Email notifications for new offers"
                description="Get notified when fixers send you offers"
                checked={emailOffers}
                onChange={(checked) => {
                  setEmailOffers(checked);
                  saveNotificationPreferences({
                    emailOffers: checked,
                    emailMessages,
                    emailJobUpdates,
                    emailReviews,
                  });
                }}
              />

              <Toggle
                label="Email notifications for messages"
                description="Get notified when you receive new messages"
                checked={emailMessages}
                onChange={(checked) => {
                  setEmailMessages(checked);
                  saveNotificationPreferences({
                    emailOffers,
                    emailMessages: checked,
                    emailJobUpdates,
                    emailReviews,
                  });
                }}
              />

              <Toggle
                label="Email notifications for job updates"
                description="Get notified about job status changes"
                checked={emailJobUpdates}
                onChange={(checked) => {
                  setEmailJobUpdates(checked);
                  saveNotificationPreferences({
                    emailOffers,
                    emailMessages,
                    emailJobUpdates: checked,
                    emailReviews,
                  });
                }}
              />

              <Toggle
                label="Email notifications for reviews"
                description="Get notified when you receive reviews"
                checked={emailReviews}
                onChange={(checked) => {
                  setEmailReviews(checked);
                  saveNotificationPreferences({
                    emailOffers,
                    emailMessages,
                    emailJobUpdates,
                    emailReviews: checked,
                  });
                }}
              />
            </div>

            <p className="text-xs text-gray-500 mt-4">
              In-app notifications are always on
            </p>
          </div>

          {/* SECTION: Privacy */}
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Privacy</h2>

            <div className="space-y-4">
              <Toggle
                label="Show my city on my profile"
                description="Others can see which city you're in"
                checked={showCity}
                onChange={(checked) => {
                  setShowCity(checked);
                  savePrivacyPreferences({ showCity: checked, showPhone });
                }}
              />

              <Toggle
                label="Show my phone number to fixers after accepting an offer"
                description="Fixers can contact you directly after you accept their offer"
                checked={showPhone}
                onChange={(checked) => {
                  setShowPhone(checked);
                  savePrivacyPreferences({ showCity, showPhone: checked });
                }}
              />
            </div>
          </div>

          {/* SECTION: Language */}
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Language</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred language
              </label>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  localStorage.setItem("language", e.target.value);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="English">English</option>
                <option value="Nederlands">Nederlands</option>
              </select>
            </div>
          </div>

          {/* SECTION: Danger Zone */}
          <div className="p-6 space-y-4 border-2 border-red-200 rounded-b-xl">
            <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>

            <div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Delete my account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmation("");
        }}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure? This will permanently delete your account and all your data.
            This cannot be undone.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleDeleteAccount}
            disabled={deleteConfirmation !== "DELETE" || isDeleting}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete my account"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
