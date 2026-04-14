"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";

interface CounterOfferFormProps {
  originalPrice: number;
  onSubmit: (counterPrice: number, counterMessage: string) => void;
  onCancel: () => void;
}

export default function CounterOfferForm({
  originalPrice,
  onSubmit,
  onCancel,
}: CounterOfferFormProps) {
  const [price, setPrice] = useState(originalPrice.toString());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(price);

    if (isNaN(numPrice) || numPrice <= 0) {
      setError("Please enter a valid price");
      return;
    }
    if (numPrice === originalPrice) {
      setError("Counter price must differ from the original");
      return;
    }

    setError("");
    onSubmit(numPrice, message.trim());
  };

  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-blue-50/50">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            Your price
          </label>
          <div className="relative mt-0.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="Your price"
              autoFocus
            />
          </div>
        </div>
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message (optional)"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Send counter
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
