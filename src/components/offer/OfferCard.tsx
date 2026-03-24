"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
import StarRating from "@/components/review/StarRating";
import { Clock, Calendar, MessageCircle, Check, X as XIcon, RotateCcw } from "lucide-react";

interface OfferCardProps {
  offer: {
    id: string;
    price: number;
    estimatedTime: string;
    message: string;
    suggestedTimes?: string[] | null;
    status: string;
    createdAt: Date | string;
    fixer: {
      id: string;
      name: string;
      avatarUrl: string | null;
      fixerProfile: {
        averageRating: number;
        totalJobs: number;
        verifiedBadge: boolean;
      } | null;
    };
  };
  isRequestOwner?: boolean;
  isOfferOwner?: boolean;
  requestStatus?: string;
  onAccept?: (offerId: string, scheduledAt?: string) => void;
  onReject?: (offerId: string) => void;
  onMessage?: (fixerId: string) => void;
  onCounterPropose?: (offerId: string, fixerId: string, fixerName: string) => void;
  onWithdraw?: (offerId: string) => void;
}

function formatSlot(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSlotShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OfferCard({ offer, isRequestOwner, isOfferOwner, requestStatus, onAccept, onReject, onMessage, onCounterPropose, onWithdraw }: OfferCardProps) {
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const canAccept = isRequestOwner && requestStatus === "OPEN" && offer.status === "PENDING";
  const times = (offer.suggestedTimes as string[] | null) || [];
  const hasTimes = times.length > 0;

  const handleAccept = async (scheduledAt?: string) => {
    if (!onAccept) return;
    setIsAccepting(true);
    try {
      await onAccept(offer.id, scheduledAt || undefined);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsRejecting(true);
    try {
      await onReject(offer.id);
    } finally {
      setIsRejecting(false);
      setShowRejectConfirm(false);
    }
  };

  const truncateMessage = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const displayMessage = showFullMessage
    ? offer.message
    : truncateMessage(offer.message, 150);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
      {/* Header: Fixer identity + Price */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          {/* Fixer info */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/profile/${offer.fixer.id}`} className="flex-shrink-0">
              <div className="relative">
                {offer.fixer.avatarUrl ? (
                  <img
                    src={offer.fixer.avatarUrl}
                    alt={offer.fixer.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm ring-2 ring-gray-100">
                    {offer.fixer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {offer.fixer.fixerProfile?.verifiedBadge && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-blue-500 rounded-full flex items-center justify-center text-white ring-2 ring-white">
                    <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  </div>
                )}
              </div>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/profile/${offer.fixer.id}`} className="font-bold text-gray-900 hover:text-primary transition-colors text-[15px]">
                  {offer.fixer.name}
                </Link>
                {offer.status === "ACCEPTED" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-full">
                    <Check className="w-3 h-3" />
                    Accepted
                  </span>
                )}
                {offer.status === "REJECTED" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-500 text-xs font-medium rounded-full">
                    <XIcon className="w-3 h-3" />
                    Not selected
                  </span>
                )}
                {offer.status === "WITHDRAWN" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-full">
                    <RotateCcw className="w-3 h-3" />
                    Withdrawn
                  </span>
                )}
              </div>
              {offer.fixer.fixerProfile && (
                <div className="flex items-center gap-2 mt-0.5">
                  <Link href={`/profile/${offer.fixer.id}`} className="hover:opacity-80 transition-opacity">
                    <StarRating rating={offer.fixer.fixerProfile.averageRating} size="sm" readOnly />
                  </Link>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">
                    {offer.fixer.fixerProfile.totalJobs} job{offer.fixer.fixerProfile.totalJobs !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-extrabold text-primary leading-none">€{offer.price}</div>
          </div>
        </div>
      </div>

      {/* Message + Estimated time */}
      <div className="px-5 pb-4">
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{displayMessage}</p>
        {offer.message.length > 150 && (
          <button
            onClick={() => setShowFullMessage(!showFullMessage)}
            className="text-primary text-xs font-semibold hover:underline mt-1"
          >
            {showFullMessage ? "Show less" : "Read more"}
          </button>
        )}
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs font-medium text-gray-600">
            <Clock className="w-3 h-3" />
            {offer.estimatedTime}
          </span>
        </div>
      </div>

      {/* Appointment Section — only for actionable offers with times */}
      {canAccept && hasTimes && (
        <div className="mx-5 mb-4 rounded-lg border border-primary/15 bg-orange-50/40 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            Choose an appointment time
          </p>

          {/* Time slot pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {times.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTime(selectedTime === t ? null : t)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTime === t
                    ? "bg-primary text-white shadow-sm ring-2 ring-primary/20"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {formatSlot(t)}
              </button>
            ))}
          </div>

          {/* Accept button — dynamic text based on selection */}
          <Button
            size="sm"
            onClick={() => handleAccept(selectedTime || undefined)}
            disabled={isAccepting}
            className="w-full"
          >
            {isAccepting
              ? "Accepting..."
              : selectedTime
                ? `Accept & book ${formatSlotShort(selectedTime)}`
                : "Select a time to book"}
          </Button>

          {/* Secondary options */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary/10">
            {onCounterPropose && (
              <button
                type="button"
                onClick={() => onCounterPropose(offer.id, offer.fixer.id, offer.fixer.name)}
                className="text-xs text-primary font-semibold hover:underline"
              >
                None of these work? Suggest other times
              </button>
            )}
            <button
              type="button"
              onClick={() => handleAccept()}
              disabled={isAccepting}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              Accept without scheduling
            </button>
          </div>
        </div>
      )}

      {/* Action Footer — for offers WITHOUT times, or non-actionable states */}
      {isRequestOwner && (
        <div className="px-5 pb-5">
          {canAccept && !hasTimes && (
            <div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept()}
                  disabled={isAccepting}
                  className="flex-1"
                >
                  {isAccepting ? "Accepting..." : "Accept offer"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMessage?.(offer.fixer.id)}
                  className="flex-1"
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                  Message
                </Button>
              </div>
              <div className="flex justify-center mt-3">
                <button
                  onClick={() => setShowRejectConfirm(true)}
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                >
                  <XIcon className="w-3 h-3" />
                  Decline this offer
                </button>
              </div>
            </div>
          )}

          {canAccept && hasTimes && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => onMessage?.(offer.fixer.id)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Message {offer.fixer.name.split(" ")[0]}
              </button>
              <span className="text-gray-300">·</span>
              <button
                onClick={() => setShowRejectConfirm(true)}
                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
              >
                <XIcon className="w-3 h-3" />
                Decline
              </button>
            </div>
          )}

          {offer.status === "PENDING" && requestStatus !== "OPEN" && (
            <p className="text-sm text-gray-500 text-center py-1">
              Request no longer accepting offers
            </p>
          )}

          {offer.status === "ACCEPTED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMessage?.(offer.fixer.id)}
              className="w-full"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              Message {offer.fixer.name.split(" ")[0]}
            </Button>
          )}
        </div>
      )}

      {/* Show times as info for non-owners or already accepted */}
      {!canAccept && hasTimes && offer.status === "ACCEPTED" && (
        <div className="px-5 pb-4">
          <span className="inline-flex items-center gap-1 text-sm text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            Appointment times were proposed
          </span>
        </div>
      )}

      {/* Fixer actions — withdraw pending offer */}
      {isOfferOwner && offer.status === "PENDING" && !showWithdrawConfirm && (
        <div className="px-5 pb-4">
          <button
            onClick={() => setShowWithdrawConfirm(true)}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Withdraw offer
          </button>
        </div>
      )}

      {/* Withdraw confirmation overlay */}
      {showWithdrawConfirm && (
        <div className="mx-5 mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">
            Withdraw this offer?
          </p>
          <p className="text-xs text-gray-500 mb-3">
            The customer will be notified. You can send a new offer later.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowWithdrawConfirm(false)}
              disabled={isWithdrawing}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setIsWithdrawing(true);
                onWithdraw?.(offer.id);
              }}
              disabled={isWithdrawing}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:bg-amber-300 transition-colors"
            >
              {isWithdrawing ? "Withdrawing..." : "Yes, withdraw"}
            </button>
          </div>
        </div>
      )}

      {/* Reject confirmation overlay */}
      {showRejectConfirm && (
        <div className="mx-5 mb-5 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">
            Decline this offer?
          </p>
          <p className="text-xs text-gray-500 mb-3">
            {offer.fixer.name.split(" ")[0]} will be notified that their offer was declined. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRejectConfirm(false)}
              disabled={isRejecting}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isRejecting}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300 transition-colors"
            >
              {isRejecting ? "Declining..." : "Yes, decline"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
