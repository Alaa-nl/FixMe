"use client";

import { useState } from "react";
import { Settings, Info, DollarSign, Save } from "lucide-react";

export default function AdminSettings() {
  const [commissionRate, setCommissionRate] = useState(15);
  const [autoReleaseHours, setAutoReleaseHours] = useState(48);
  const [minJobFee, setMinJobFee] = useState(0);
  const [maxPhotos, setMaxPhotos] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionRate,
          autoReleaseHours,
          minJobFee,
          maxPhotos,
        }),
      });

      if (response.ok) {
        setSaveMessage("Settings saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setSaveMessage("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Platform Settings</h1>
        <p className="text-gray-600 mt-2">Configure platform-wide settings and parameters</p>
      </div>

      {/* Current Settings (Note: These are hardcoded for now) */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Info size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold text-blue-800">Current Configuration</h2>
        </div>
        <p className="text-sm text-blue-700 mb-4">
          These settings are currently hardcoded in the application. Database-backed settings will be implemented in a future update.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Platform Commission</p>
            <p className="text-2xl font-bold text-gray-800">15%</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Auto-Release Timeout</p>
            <p className="text-2xl font-bold text-gray-800">48 hours</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Minimum Job Fee</p>
            <p className="text-2xl font-bold text-gray-800">€0</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Max Photos Per Request</p>
            <p className="text-2xl font-bold text-gray-800">5 photos</p>
          </div>
        </div>
      </div>

      {/* Platform Settings Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings size={24} className="text-primary" />
          <h2 className="text-2xl font-bold text-gray-800">Platform Parameters</h2>
        </div>

        <div className="space-y-6">
          {/* Commission Rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Platform Commission (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={commissionRate}
              onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Percentage of each job that goes to the platform
            </p>
          </div>

          {/* Auto-Release Timeout */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Auto-Release Timeout (hours)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={autoReleaseHours}
              onChange={(e) => setAutoReleaseHours(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Time before payment is automatically released to fixer after job completion
            </p>
          </div>

          {/* Minimum Job Fee */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Job Fee (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={minJobFee}
              onChange={(e) => setMinJobFee(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum amount that can be charged for a job
            </p>
          </div>

          {/* Max Photos */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Photos Per Request
            </label>
            <input
              type="number"
              min="1"
              max="20"
              step="1"
              value={maxPhotos}
              onChange={(e) => setMaxPhotos(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of photos customers can upload per repair request
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              <Save size={20} />
              {isSaving ? "Saving..." : "Save Settings"}
            </button>

            {saveMessage && (
              <p className={`mt-3 text-sm ${saveMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                {saveMessage}
              </p>
            )}

            <p className="mt-3 text-xs text-gray-500">
              Note: Settings functionality will be fully implemented with database storage in a future update.
              Currently, these values are informational and changes are not persisted.
            </p>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Info size={24} className="text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-800">System Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Platform Name</p>
            <p className="text-lg font-semibold text-gray-800">FixMe</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Environment</p>
            <p className="text-lg font-semibold text-gray-800">
              {process.env.NODE_ENV === "production" ? "Production" : "Development"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Database</p>
            <p className="text-lg font-semibold text-gray-800">PostgreSQL</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Payment Provider</p>
            <p className="text-lg font-semibold text-gray-800">Mollie (Pending Setup)</p>
          </div>
        </div>
      </div>

      {/* Supported Cities */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Supported Cities</h2>
        <div className="flex flex-wrap gap-2">
          {["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere", "Breda", "Nijmegen"].map((city) => (
            <span
              key={city}
              className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium"
            >
              {city}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          FixMe currently operates in major Dutch cities. City management will be enhanced in future updates.
        </p>
      </div>
    </div>
  );
}
