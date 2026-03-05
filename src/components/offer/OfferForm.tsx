"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import { Calendar, Plus, X, Clock } from "lucide-react";

interface OfferFormProps {
  repairRequestId: string;
  onSuccess?: () => void;
}

function formatSlotPreview(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Get minimum datetime for the input (now + 2 hours)
function getMinDatetime(): string {
  const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export default function OfferForm({ repairRequestId, onSuccess }: OfferFormProps) {
  const [price, setPrice] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [message, setMessage] = useState("");
  const [suggestedTimes, setSuggestedTimes] = useState<string[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const addTimeSlot = () => {
    if (!newTimeSlot) return;
    const iso = new Date(newTimeSlot).toISOString();
    if (suggestedTimes.includes(iso)) return;
    if (suggestedTimes.length >= 5) return;
    setSuggestedTimes([...suggestedTimes, iso]);
    setNewTimeSlot("");
  };

  const removeTimeSlot = (idx: number) => {
    setSuggestedTimes(suggestedTimes.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Please enter a valid price");
      return;
    }

    if (!estimatedTime.trim()) {
      setError("Please enter an estimated time");
      return;
    }

    if (message.trim().length < 20) {
      setError("Message must be at least 20 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repairRequestId,
          price: priceNum,
          estimatedTime: estimatedTime.trim(),
          message: message.trim(),
          suggestedTimes: suggestedTimes.length > 0 ? suggestedTimes : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit offer");
      }

      setSuccess(true);
      setPrice("");
      setEstimatedTime("");
      setMessage("");
      setSuggestedTimes([]);

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error("Error submitting offer:", err);
      setError(err instanceof Error ? err.message : "Failed to submit offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-xl border-2 border-primary p-6">
        <div className="text-center">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Offer sent!</h3>
          <p className="text-gray-600">
            The customer will be notified and can accept your offer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-t-4 border-t-primary border-x border-b border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Make an offer</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Price Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your price *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
              €
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Your price"
              step="0.01"
              min="0"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>

        {/* Estimated Time Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Estimated time *
          </label>
          <input
            type="text"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="e.g. 1 hour, 2 days"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* Suggested Appointment Times */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            Suggest appointment times
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Suggest up to 5 time slots so the customer can pick one
          </p>

          {/* Existing time slots */}
          {suggestedTimes.length > 0 && (
            <div className="space-y-2 mb-3">
              {suggestedTimes.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {formatSlotPreview(t)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new time slot */}
          {suggestedTimes.length < 5 && (
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                min={getMinDatetime()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addTimeSlot}
                disabled={!newTimeSlot}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Message Textarea */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Message * (min. 20 characters)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself and explain how you would fix this"
            rows={5}
            minLength={20}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            required
          ></textarea>
          <div className="text-xs text-gray-500 mt-1">
            {message.length}/20 characters minimum
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Sending offer..." : "Send offer"}
        </Button>
      </form>
    </div>
  );
}
