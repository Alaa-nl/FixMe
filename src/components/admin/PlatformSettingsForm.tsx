"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Settings,
  MapPin,
  Bell,
  Save,
  Loader2,
  X,
  Plus,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { PlatformSettings } from "@/lib/platformSettings";

interface PlatformSettingsFormProps {
  settings: PlatformSettings;
  canEdit: boolean;
}

export default function PlatformSettingsForm({
  settings,
  canEdit,
}: PlatformSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Financial Settings
  const [commissionPercentage, setCommissionPercentage] = useState(
    settings.commissionPercentage
  );
  const [minJobFee, setMinJobFee] = useState(settings.minJobFee);
  const [maxJobFee, setMaxJobFee] = useState(settings.maxJobFee ?? "");
  const [autoReleaseHours, setAutoReleaseHours] = useState(
    settings.autoReleaseHours
  );

  // Platform Rules
  const [maxPhotosPerRequest, setMaxPhotosPerRequest] = useState(
    settings.maxPhotosPerRequest
  );
  const [maxVideoSeconds, setMaxVideoSeconds] = useState(
    settings.maxVideoSeconds
  );
  const [maxOffersPerRequest, setMaxOffersPerRequest] = useState(
    settings.maxOffersPerRequest
  );
  const [disputeWindowHours, setDisputeWindowHours] = useState(
    settings.disputeWindowHours
  );
  const [reviewEditDays, setReviewEditDays] = useState(settings.reviewEditDays);
  const [accountDeletionDays, setAccountDeletionDays] = useState(
    settings.accountDeletionDays
  );
  const [requireKvk, setRequireKvk] = useState(settings.requireKvk);
  const [allowUnverifiedFixers, setAllowUnverifiedFixers] = useState(
    settings.allowUnverifiedFixers
  );
  const [minFixerRating, setMinFixerRating] = useState(settings.minFixerRating);

  // Active Cities
  const [activeCities, setActiveCities] = useState<string[]>(
    settings.activeCities
  );
  const [newCity, setNewCity] = useState("");

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState(
    settings.notificationSettings
  );

  const handleAddCity = () => {
    const city = newCity.trim();
    if (!city) {
      toast.error("Please enter a city name");
      return;
    }
    if (activeCities.some((c) => c.toLowerCase() === city.toLowerCase())) {
      toast.error("City already exists");
      return;
    }
    setActiveCities([...activeCities, city]);
    setNewCity("");
  };

  const handleRemoveCity = (city: string) => {
    if (activeCities.length === 1) {
      toast.error("Cannot remove the last city");
      return;
    }
    setActiveCities(activeCities.filter((c) => c !== city));
  };

  const handleNotificationToggle = (key: string) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key as keyof typeof notificationSettings],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      toast.error("You don't have permission to edit settings");
      return;
    }

    if (activeCities.length === 0) {
      toast.error("At least one active city is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commissionPercentage,
          minJobFee,
          maxJobFee: maxJobFee === "" ? null : parseFloat(maxJobFee as string),
          autoReleaseHours,
          maxPhotosPerRequest,
          maxVideoSeconds,
          maxOffersPerRequest,
          disputeWindowHours,
          reviewEditDays,
          accountDeletionDays,
          requireKvk,
          allowUnverifiedFixers,
          minFixerRating,
          activeCities,
          notificationSettings,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      toast.success("Settings updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Calculate preview values
  const previewPrice = 100;
  const previewPlatformFee = (previewPrice * commissionPercentage) / 100;
  const previewFixerPayout = previewPrice - previewPlatformFee;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Financial Settings */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <DollarSign className="text-green-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">
            Financial Settings
          </h2>
        </div>

        <div className="space-y-6">
          {/* Commission Percentage */}
          <div>
            <Label htmlFor="commission">
              Platform Commission Percentage (0-50%)
            </Label>
            <Input
              id="commission"
              type="number"
              min="0"
              max="50"
              step="0.1"
              value={commissionPercentage}
              onChange={(e) =>
                setCommissionPercentage(parseFloat(e.target.value))
              }
              disabled={!canEdit}
              className="mt-1"
            />
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Preview:</strong> On a €{previewPrice} repair: Platform
                gets €{previewPlatformFee.toFixed(2)}, Fixer gets €
                {previewFixerPayout.toFixed(2)}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Changes apply to NEW jobs only, not existing ones
            </p>
          </div>

          {/* Min and Max Job Fee */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minFee">Minimum Job Fee (€)</Label>
              <Input
                id="minFee"
                type="number"
                min="0"
                step="0.01"
                value={minJobFee}
                onChange={(e) => setMinJobFee(parseFloat(e.target.value))}
                disabled={!canEdit}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="maxFee">
                Maximum Job Fee (€) - Optional
              </Label>
              <Input
                id="maxFee"
                type="number"
                min="0"
                step="0.01"
                value={maxJobFee}
                onChange={(e) => setMaxJobFee(e.target.value)}
                placeholder="Unlimited"
                disabled={!canEdit}
                className="mt-1"
              />
            </div>
          </div>

          {/* Auto-Release Hours */}
          <div>
            <Label htmlFor="autoRelease">
              Auto-Release Payment (Hours After Completion)
            </Label>
            <Input
              id="autoRelease"
              type="number"
              min="1"
              step="1"
              value={autoReleaseHours}
              onChange={(e) => setAutoReleaseHours(parseInt(e.target.value))}
              disabled={!canEdit}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Payment automatically released to fixer after this period
            </p>
          </div>
        </div>
      </div>

      {/* Platform Rules */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="text-[#FF6B35]" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Platform Rules</h2>
        </div>

        <div className="space-y-6">
          {/* Upload Limits */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxPhotos">
                Maximum Photos Per Request (1-10)
              </Label>
              <Input
                id="maxPhotos"
                type="number"
                min="1"
                max="10"
                step="1"
                value={maxPhotosPerRequest}
                onChange={(e) =>
                  setMaxPhotosPerRequest(parseInt(e.target.value))
                }
                disabled={!canEdit}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="maxVideo">
                Maximum Video Length (Seconds)
              </Label>
              <Input
                id="maxVideo"
                type="number"
                min="10"
                step="10"
                value={maxVideoSeconds}
                onChange={(e) => setMaxVideoSeconds(parseInt(e.target.value))}
                disabled={!canEdit}
                className="mt-1"
              />
            </div>
          </div>

          {/* Request and Dispute Limits */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxOffers">Maximum Offers Per Request</Label>
              <Input
                id="maxOffers"
                type="number"
                min="1"
                step="1"
                value={maxOffersPerRequest}
                onChange={(e) =>
                  setMaxOffersPerRequest(parseInt(e.target.value))
                }
                disabled={!canEdit}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="disputeWindow">
                Dispute Window (Hours, 24-168)
              </Label>
              <Input
                id="disputeWindow"
                type="number"
                min="24"
                max="168"
                step="1"
                value={disputeWindowHours}
                onChange={(e) =>
                  setDisputeWindowHours(parseInt(e.target.value))
                }
                disabled={!canEdit}
                className="mt-1"
              />
            </div>
          </div>

          {/* Time Windows */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reviewEdit">Review Edit Window (Days)</Label>
              <Input
                id="reviewEdit"
                type="number"
                min="0"
                step="1"
                value={reviewEditDays}
                onChange={(e) => setReviewEditDays(parseInt(e.target.value))}
                disabled={!canEdit}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="accountDeletion">
                Account Deletion Delay (Days)
              </Label>
              <Input
                id="accountDeletion"
                type="number"
                min="0"
                step="1"
                value={accountDeletionDays}
                onChange={(e) =>
                  setAccountDeletionDays(parseInt(e.target.value))
                }
                disabled={!canEdit}
                className="mt-1"
              />
            </div>
          </div>

          {/* Fixer Requirements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  Require KVK for Fixers
                </p>
                <p className="text-sm text-gray-600">
                  Fixers must provide a valid KVK number to register
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRequireKvk(!requireKvk)}
                disabled={!canEdit}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  requireKvk ? "bg-green-600" : "bg-gray-300"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    requireKvk ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  Allow Unverified Fixers to Make Offers
                </p>
                <p className="text-sm text-gray-600">
                  Fixers can send offers before KVK verification
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAllowUnverifiedFixers(!allowUnverifiedFixers)
                }
                disabled={!canEdit}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowUnverifiedFixers ? "bg-green-600" : "bg-gray-300"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowUnverifiedFixers ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div>
              <Label htmlFor="minRating">
                Minimum Fixer Rating to Stay Active (0-5)
              </Label>
              <Input
                id="minRating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={minFixerRating}
                onChange={(e) => setMinFixerRating(parseFloat(e.target.value))}
                disabled={!canEdit}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Set to 0 to disable. Fixers below this rating will be
                deactivated.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Cities */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Active Cities</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="newCity">Add City</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="newCity"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Amsterdam"
                disabled={!canEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCity();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddCity}
                disabled={!canEdit}
                variant="outline"
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeCities.map((city) => (
              <div
                key={city}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-800 rounded-lg border border-blue-200"
              >
                <span className="font-medium">{city}</span>
                {canEdit && activeCities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCity(city)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <Info size={16} className="inline mr-1" />
              Requests from non-active cities will show: "FixMe is not yet
              available in your area"
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-purple-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">
            Email Notifications
          </h2>
        </div>

        <div className="space-y-3">
          {Object.entries(notificationSettings).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle(key)}
                disabled={!canEdit}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? "bg-green-600" : "bg-gray-300"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      {canEdit && (
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
          >
            {loading && <Loader2 className="mr-2 animate-spin" size={18} />}
            <Save className="mr-2" size={18} />
            Save All Settings
          </Button>
        </div>
      )}

      {!canEdit && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            You don't have permission to edit settings. Contact an administrator
            to request access.
          </p>
        </div>
      )}
    </form>
  );
}
