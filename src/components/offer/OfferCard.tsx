"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import StarRating from "@/components/review/StarRating";

interface OfferCardProps {
  offer: {
    id: string;
    price: number;
    estimatedTime: string;
    message: string;
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
  requestStatus?: string;
  onAccept?: (offerId: string) => void;
  onMessage?: (fixerId: string) => void;
}

export default function OfferCard({ offer, isRequestOwner, requestStatus, onAccept, onMessage }: OfferCardProps) {
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Determine if the Accept button should be shown
  const canAccept = isRequestOwner && requestStatus === "OPEN" && offer.status === "PENDING";

  const handleAccept = async () => {
    if (!onAccept) return;
    setIsAccepting(true);
    try {
      await onAccept(offer.id);
    } finally {
      setIsAccepting(false);
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            {offer.fixer.avatarUrl ? (
              <img
                src={offer.fixer.avatarUrl}
                alt={offer.fixer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                {offer.fixer.name.charAt(0).toUpperCase()}
              </div>
            )}
            {offer.fixer.fixerProfile?.verifiedBadge && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                ✓
              </div>
            )}
          </div>
        </div>

        {/* Middle: Fixer Info & Message */}
        <div className="flex-1 min-w-0">
          {/* Fixer Name & Stats */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-800">{offer.fixer.name}</h3>
            {offer.fixer.fixerProfile && (
              <>
                <Link
                  href={`/fixer/${offer.fixer.id}`}
                  className="hover:opacity-80 transition-opacity"
                  title="View profile and reviews"
                >
                  <StarRating
                    rating={offer.fixer.fixerProfile.averageRating}
                    size="sm"
                    readOnly
                  />
                </Link>
                <span className="text-sm text-gray-500">
                  ({offer.fixer.fixerProfile.totalJobs} job{offer.fixer.fixerProfile.totalJobs !== 1 ? "s" : ""})
                </span>
              </>
            )}
          </div>

          {/* Message */}
          <p className="text-gray-700 mb-2 whitespace-pre-wrap">{displayMessage}</p>
          {offer.message.length > 150 && (
            <button
              onClick={() => setShowFullMessage(!showFullMessage)}
              className="text-primary text-sm font-medium hover:underline"
            >
              {showFullMessage ? "Show less" : "Read more"}
            </button>
          )}

          {/* Estimated Time */}
          <div className="mt-3 text-sm text-gray-600">
            <span>⏱ {offer.estimatedTime}</span>
          </div>
        </div>

        {/* Right: Price & Actions */}
        <div className="flex-shrink-0 flex flex-col items-end justify-between gap-3">
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">€{offer.price}</div>

            {/* Status Badge */}
            {offer.status === "ACCEPTED" && (
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-300 text-green-800 text-sm font-semibold rounded-full">
                <span>✓</span>
                <span>Accepted</span>
              </div>
            )}
            {offer.status === "REJECTED" && (
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-300 text-gray-600 text-sm font-medium rounded-full">
                <span>✕</span>
                <span>Not selected</span>
              </div>
            )}
            {offer.status === "WITHDRAWN" && (
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm font-medium rounded-full">
                <span>⎌</span>
                <span>Withdrawn</span>
              </div>
            )}
          </div>

          {isRequestOwner && (
            <div className="flex flex-col gap-2 w-full md:w-auto">
              {canAccept ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAccept}
                    disabled={isAccepting}
                    className="w-full md:w-auto"
                  >
                    {isAccepting ? "Accepting..." : "Accept offer"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMessage?.(offer.fixer.id)}
                    className="w-full md:w-auto"
                  >
                    Message
                  </Button>
                </>
              ) : offer.status === "PENDING" && requestStatus !== "OPEN" ? (
                <div className="text-sm text-gray-600 text-center">
                  Request no longer accepting offers
                </div>
              ) : offer.status === "ACCEPTED" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMessage?.(offer.fixer.id)}
                  className="w-full md:w-auto"
                >
                  Message fixer
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
