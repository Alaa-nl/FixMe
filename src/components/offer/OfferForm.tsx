"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface OfferFormProps {
  repairRequestId: string;
  onSuccess?: () => void;
}

export default function OfferForm({ repairRequestId, onSuccess }: OfferFormProps) {
  const [price, setPrice] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
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

      // Call onSuccess callback or reload page
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
          variant="primary"
          size="lg"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Sending offer..." : "Send offer"}
        </Button>
      </form>
    </div>
  );
}
