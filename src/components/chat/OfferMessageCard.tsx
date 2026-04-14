"use client";

import { useState } from "react";
import { timeAgo } from "@/lib/utils";
import {
  Clock,
  Star,
  CheckCircle,
  XCircle,
  ArrowLeftRight,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import CounterOfferForm from "./CounterOfferForm";

interface OfferMessageCardProps {
  metadata: {
    offerId: string;
    price: number;
    estimatedTime: string;
    message: string;
    suggestedTimes?: string[] | null;
    fixerName: string;
    fixerAvatar?: string | null;
    fixerRating: number;
    fixerTotalJobs: number;
    fixerVerified: boolean;
  };
  createdAt: Date | string;
  currentUserId: string;
  isCustomer: boolean;
  offerStatus?: string;
  onAction: (action: string, data: Record<string, unknown>) => void;
}

export default function OfferMessageCard({
  metadata,
  createdAt,
  currentUserId,
  isCustomer,
  offerStatus,
  onAction,
}: OfferMessageCardProps) {
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  const isPending = !offerStatus || offerStatus === "PENDING";
  const showActions = isCustomer && isPending;

  const handleAccept = async () => {
    setIsActioning(true);
    onAction("accept-offer", { offerId: metadata.offerId });
  };

  const handleReject = async () => {
    setIsActioning(true);
    onAction("reject-offer", { offerId: metadata.offerId });
  };

  const handleCounter = (counterPrice: number, counterMessage: string) => {
    setShowCounterForm(false);
    onAction("counter-offer", {
      offerId: metadata.offerId,
      counterPrice,
      counterMessage,
    });
  };

  const statusBadge = () => {
    if (!offerStatus || offerStatus === "PENDING") return null;
    const badges: Record<string, { label: string; color: string }> = {
      ACCEPTED: { label: "Accepted", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      REJECTED: { label: "Declined", color: "bg-red-50 text-red-600 border-red-200" },
      WITHDRAWN: { label: "Withdrawn", color: "bg-gray-100 text-gray-500 border-gray-200" },
      COUNTERED: { label: "Countered", color: "bg-blue-50 text-blue-600 border-blue-200" },
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
      <div className="w-[88%] max-w-sm bg-white border border-gray-200/80 rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {metadata.fixerAvatar ? (
              <img
                src={metadata.fixerAvatar}
                alt={metadata.fixerName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-gray-100">
                {metadata.fixerName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold font-display text-secondary-800">
                  {metadata.fixerName}
                </span>
                {metadata.fixerVerified && (
                  <BadgeCheck className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2.5 text-[11px] text-gray-400 mt-0.5">
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {metadata.fixerRating.toFixed(1)}
                </span>
                <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                <span>{metadata.fixerTotalJobs} jobs</span>
              </div>
            </div>
          </div>
          {statusBadge()}
        </div>

        {/* Price + time */}
        <div className="px-5 py-3 bg-gradient-to-r from-primary-50/50 to-transparent border-y border-gray-100">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-display font-bold text-secondary-900">
                €{metadata.price}
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {metadata.estimatedTime}
            </span>
          </div>
        </div>

        {/* Message */}
        {metadata.message && (
          <div className="px-5 py-3">
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {metadata.message}
            </p>
          </div>
        )}

        {/* Suggested times */}
        {metadata.suggestedTimes && metadata.suggestedTimes.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Available times
            </p>
            <div className="flex flex-wrap gap-1.5">
              {metadata.suggestedTimes.map((time, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-1 bg-secondary-50 text-secondary-700 rounded-lg font-medium"
                >
                  {new Date(time).toLocaleDateString("en-NL", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {showActions && !showCounterForm && (
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
              onClick={() => setShowCounterForm(true)}
              disabled={isActioning}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-secondary-50 text-secondary-700 text-sm font-semibold rounded-xl hover:bg-secondary-100 transition-all disabled:opacity-50"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Counter
            </button>
            <button
              onClick={handleReject}
              disabled={isActioning}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-gray-400 text-sm font-medium rounded-xl hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Counter-offer form */}
        {showCounterForm && (
          <CounterOfferForm
            originalPrice={metadata.price}
            onSubmit={handleCounter}
            onCancel={() => setShowCounterForm(false)}
          />
        )}

        {/* Timestamp */}
        <div className="px-5 py-2 border-t border-gray-50">
          <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase tabular-nums">
            {timeAgo(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
