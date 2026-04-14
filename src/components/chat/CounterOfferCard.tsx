"use client";

import { useState } from "react";
import { timeAgo } from "@/lib/utils";
import { ArrowLeftRight, CheckCircle, XCircle } from "lucide-react";

interface CounterOfferCardProps {
  metadata: {
    offerId: string;
    originalOfferId?: string;
    originalPrice: number;
    counterPrice: number;
    counterMessage?: string | null;
    customerName?: string;
  };
  createdAt: Date | string;
  currentUserId: string;
  isFixer: boolean;
  offerStatus?: string;
  onAction: (action: string, data: Record<string, unknown>) => void;
}

export default function CounterOfferCard({
  metadata,
  createdAt,
  currentUserId,
  isFixer,
  offerStatus,
  onAction,
}: CounterOfferCardProps) {
  const [isActioning, setIsActioning] = useState(false);

  const isPending = !offerStatus || offerStatus === "PENDING";
  const showActions = isFixer && isPending;

  const handleAccept = () => {
    setIsActioning(true);
    onAction("accept-counter", { offerId: metadata.offerId });
  };

  const handleReject = () => {
    setIsActioning(true);
    onAction("reject-counter", { offerId: metadata.offerId });
  };

  const statusBadge = () => {
    if (!offerStatus || offerStatus === "PENDING") return null;
    const badges: Record<string, { label: string; color: string }> = {
      ACCEPTED: { label: "Accepted", color: "bg-emerald-100 text-emerald-700" },
      REJECTED: { label: "Declined", color: "bg-red-100 text-red-700" },
    };
    const badge = badges[offerStatus];
    if (!badge) return null;
    return (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="flex justify-center my-3">
      <div className="w-[85%] max-w-sm bg-white border border-blue-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between bg-blue-50/50">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Counter-offer</span>
          </div>
          {statusBadge()}
        </div>

        {/* Price comparison */}
        <div className="px-4 py-3 border-t border-blue-100">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs text-gray-400">Original</span>
              <p className="text-lg text-gray-400 line-through">€{metadata.originalPrice}</p>
            </div>
            <ArrowLeftRight className="w-4 h-4 text-gray-300" />
            <div>
              <span className="text-xs text-blue-600 font-medium">Counter</span>
              <p className="text-2xl font-bold text-blue-700">€{metadata.counterPrice}</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {metadata.counterMessage && (
          <div className="px-4 py-2 border-t border-blue-100">
            <p className="text-sm text-gray-600">{metadata.counterMessage}</p>
          </div>
        )}

        {/* Action buttons (only for fixer) */}
        {showActions && (
          <div className="px-4 py-3 border-t border-blue-100 flex gap-2">
            <button
              onClick={handleAccept}
              disabled={isActioning}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={handleReject}
              disabled={isActioning}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Decline
            </button>
          </div>
        )}

        {/* Timestamp */}
        <div className="px-4 py-1.5 border-t border-blue-50">
          <span className="text-[10px] text-gray-400">{timeAgo(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
