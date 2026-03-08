"use client";

import { useState } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

interface DisputeCardProps {
  dispute: {
    id: string;
    reason: string;
    resolution: string;
    createdAt: Date | string;
    resolvedAt?: Date | string | null;
    adminNotes?: string | null;
    fixerResponseType?: string | null;
    fixerRefundAmount?: number | null;
    fixerMessage?: string | null;
    fixerRespondedAt?: Date | string | null;
    customerAccepted?: boolean | null;
    escalationReason?: string | null;
    job: {
      id: string;
      repairRequest: {
        id: string;
        title: string;
      };
      customer: {
        id: string;
        name: string;
        avatarUrl: string | null;
      };
      fixer: {
        id: string;
        name: string;
        avatarUrl: string | null;
      };
    };
    openedBy: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  };
  isAdmin?: boolean;
  currentUserId?: string;
  disputeWindowHours?: number;
}

export default function DisputeCard({ dispute, isAdmin, currentUserId, disputeWindowHours = 72 }: DisputeCardProps) {
  const [showFullReason, setShowFullReason] = useState(false);

  // Compute countdown for PENDING disputes
  const hoursElapsed = (Date.now() - new Date(dispute.createdAt).getTime()) / (1000 * 60 * 60);
  const hoursRemaining = Math.max(0, disputeWindowHours - hoursElapsed);
  const isPending = dispute.resolution === "PENDING";

  const isFixer = currentUserId === dispute.job.fixer.id;
  const isCustomer = currentUserId === dispute.job.customer.id;

  const getStatusBadge = (resolution: string) => {
    switch (resolution) {
      case "PENDING":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
            Awaiting fixer
          </span>
        );
      case "FIXER_OFFERED":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
            Offer pending
          </span>
        );
      case "FIXER_REJECTED":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
            Fixer rejected
          </span>
        );
      case "ESCALATED":
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full">
            Escalated
          </span>
        );
      case "REFUNDED":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
            Refunded
          </span>
        );
      case "PARTIAL_REFUND":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
            Partial refund
          </span>
        );
      case "RELEASED":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
            Released
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">
            {resolution}
          </span>
        );
    }
  };

  const truncateReason = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const displayReason = showFullReason
    ? dispute.reason
    : truncateReason(dispute.reason, 100);

  // Action indicator for the user
  const getActionIndicator = () => {
    if (isPending && isFixer) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg text-sm">
          <span className="font-semibold text-yellow-800">Your response needed</span>
          <span className="text-yellow-600 ml-2">
            {Math.floor(hoursRemaining)}h {Math.floor((hoursRemaining % 1) * 60)}m remaining
          </span>
        </div>
      );
    }
    if (dispute.resolution === "FIXER_OFFERED" && isCustomer) {
      return (
        <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-sm">
          <span className="font-semibold text-blue-800">Review fixer&apos;s offer</span>
          <span className="text-blue-600 ml-2">
            {dispute.fixerResponseType === "FULL_REFUND"
              ? "Full refund offered"
              : `€${dispute.fixerRefundAmount?.toFixed(2)} partial refund offered`}
          </span>
        </div>
      );
    }
    if (["FIXER_REJECTED", "ESCALATED"].includes(dispute.resolution) && isAdmin) {
      return (
        <div className="bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg text-sm">
          <span className="font-semibold text-orange-800">Admin review needed</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4">
        {/* Header: Status + Date */}
        <div className="flex items-center justify-between">
          {getStatusBadge(dispute.resolution)}
          <span className="text-sm text-gray-500">
            Opened {timeAgo(dispute.createdAt)}
          </span>
        </div>

        {/* Action Indicator */}
        {getActionIndicator()}

        {/* Job Title */}
        <div>
          <Link
            href={`/disputes/${dispute.id}`}
            className="text-lg font-bold text-gray-800 hover:text-primary transition-colors"
          >
            {dispute.job.repairRequest.title}
          </Link>
        </div>

        {/* Customer & Fixer */}
        <div className="flex items-center gap-4">
          <Link href={`/profile/${dispute.job.customer.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {dispute.job.customer.avatarUrl ? (
              <img
                src={dispute.job.customer.avatarUrl}
                alt={dispute.job.customer.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold">
                {dispute.job.customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-600 hover:text-primary transition-colors">{dispute.job.customer.name}</span>
          </Link>

          <span className="text-gray-400">vs</span>

          <Link href={`/profile/${dispute.job.fixer.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {dispute.job.fixer.avatarUrl ? (
              <img
                src={dispute.job.fixer.avatarUrl}
                alt={dispute.job.fixer.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold">
                {dispute.job.fixer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-600 hover:text-primary transition-colors">{dispute.job.fixer.name}</span>
          </Link>
        </div>

        {/* Reason */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-1">Reason:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{displayReason}</p>
          {dispute.reason.length > 100 && (
            <button
              onClick={() => setShowFullReason(!showFullReason)}
              className="text-primary text-sm font-medium hover:underline mt-2"
            >
              {showFullReason ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* Fixer offer summary (if offered) */}
        {dispute.fixerRespondedAt && dispute.fixerResponseType !== "REJECT" && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900">
              Fixer offered: {dispute.fixerResponseType === "FULL_REFUND" ? "Full refund" : `€${dispute.fixerRefundAmount?.toFixed(2)} partial refund`}
            </p>
            {dispute.customerAccepted !== null && (
              <p className="text-xs text-blue-700 mt-1">
                Customer {dispute.customerAccepted ? "accepted" : "rejected"} this offer
              </p>
            )}
          </div>
        )}

        {/* Admin Notes (if resolved) */}
        {["REFUNDED", "PARTIAL_REFUND", "RELEASED"].includes(dispute.resolution) && dispute.adminNotes && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-1">Admin Resolution Notes:</p>
            <p className="text-blue-800 text-sm">{dispute.adminNotes}</p>
            {dispute.resolvedAt && (
              <p className="text-xs text-blue-600 mt-2">
                Resolved {timeAgo(dispute.resolvedAt)}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link
            href={`/disputes/${dispute.id}`}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            View details
          </Link>
          {isPending && isFixer && (
            <Link
              href={`/disputes/${dispute.id}`}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Respond now
            </Link>
          )}
          {dispute.resolution === "FIXER_OFFERED" && isCustomer && (
            <Link
              href={`/disputes/${dispute.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Review offer
            </Link>
          )}
          {isAdmin && ["FIXER_REJECTED", "ESCALATED", "PENDING", "FIXER_OFFERED"].includes(dispute.resolution) && (
            <Link
              href={`/disputes/${dispute.id}`}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Resolve dispute
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
