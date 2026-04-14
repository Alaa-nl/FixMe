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
    <div className="px-5 py-4 border-t border-gray-100 bg-secondary-50/30">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Your price
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
              €
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-300 focus:border-secondary-300 bg-white font-medium"
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
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-300 focus:border-secondary-300 resize-none bg-white placeholder:text-gray-400"
          />
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-secondary-700 text-white text-sm font-semibold rounded-xl hover:bg-secondary-800 transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Send counter
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
