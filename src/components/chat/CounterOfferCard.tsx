"use client";

import { useState } from "react";
import { timeAgo } from "@/lib/utils";
import { ArrowLeftRight, CheckCircle, XCircle, Loader2 } from "lucide-react";

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
      ACCEPTED: { label: "Accepted", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      REJECTED: { label: "Declined", color: "bg-red-50 text-red-600 border-red-200" },
    };
    const badge = badges[offerStatus];
    if (!badge) return null;
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="flex justify-center my-4">
      <div className="w-[85%] max-w-sm bg-white border border-secondary-200/60 rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between bg-gradient-to-r from-secondary-50/50 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary-100 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-secondary-600" />
            </div>
            <span className="text-sm font-bold font-display text-secondary-800">Counter-offer</span>
          </div>
          {statusBadge()}
        </div>

        {/* Price comparison */}
        <div className="px-5 py-4 border-t border-secondary-100/50">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block mb-1">
                Original
              </span>
              <p className="text-lg text-gray-300 line-through font-display font-bold">
                €{metadata.originalPrice}
              </p>
            </div>
            <div className="flex-shrink-0">
              <ArrowLeftRight className="w-4 h-4 text-gray-300" />
            </div>
            <div className="text-center">
              <span className="text-[10px] text-secondary-500 font-bold uppercase tracking-wider block mb-1">
                Counter
              </span>
              <p className="text-2xl font-display font-bold text-secondary-800">
                €{metadata.counterPrice}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {metadata.counterMessage && (
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed">{metadata.counterMessage}</p>
          </div>
        )}

        {/* Action buttons (only for fixer) */}
        {showActions && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex gap-2">
            <button
              onClick={handleAccept}
              disabled={isActioning}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm"
            >
              {isActioning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Accept
            </button>
            <button
              onClick={handleReject}
              disabled={isActioning}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
            >
              {isActioning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Decline
            </button>
          </div>
        )}

        <div className="px-5 py-2 border-t border-gray-50">
          <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase tabular-nums">
            {timeAgo(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
