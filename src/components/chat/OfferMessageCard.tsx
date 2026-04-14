"use client";

import { useState } from "react";
import { timeAgo } from "@/lib/utils";
import { Clock, Star, CheckCircle, XCircle, ArrowLeftRight, BadgeCheck } from "lucide-react";
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
      ACCEPTED: { label: "Accepted", color: "bg-emerald-100 text-emerald-700" },
      REJECTED: { label: "Declined", color: "bg-red-100 text-red-700" },
      WITHDRAWN: { label: "Withdrawn", color: "bg-gray-100 text-gray-600" },
      COUNTERED: { label: "Countered", color: "bg-blue-100 text-blue-700" },
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
      <div className="w-[85%] max-w-sm bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {metadata.fixerAvatar ? (
              <img
                src={metadata.fixerAvatar}
                alt={metadata.fixerName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">
                {metadata.fixerName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-800">{metadata.fixerName}</span>
                {metadata.fixerVerified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {metadata.fixerRating.toFixed(1)}
                </span>
                <span>{metadata.fixerTotalJobs} jobs</span>
              </div>
            </div>
          </div>
          {statusBadge()}
        </div>

        {/* Price + time */}
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">€{metadata.price}</span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {metadata.estimatedTime}
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-3">{metadata.message}</p>
        </div>

        {/* Suggested times */}
        {metadata.suggestedTimes && metadata.suggestedTimes.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
              Suggested times
            </p>
            <div className="flex flex-wrap gap-1">
              {metadata.suggestedTimes.map((time, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md"
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
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
            <button
              onClick={handleAccept}
              disabled={isActioning}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => setShowCounterForm(true)}
              disabled={isActioning}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Counter
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

        {/* Counter-offer form */}
        {showCounterForm && (
          <CounterOfferForm
            originalPrice={metadata.price}
            onSubmit={handleCounter}
            onCancel={() => setShowCounterForm(false)}
          />
        )}

        {/* Timestamp */}
        <div className="px-4 py-1.5 border-t border-gray-50">
          <span className="text-[10px] text-gray-400">{timeAgo(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
