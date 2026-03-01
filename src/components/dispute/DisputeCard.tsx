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
}

export default function DisputeCard({ dispute, isAdmin }: DisputeCardProps) {
  const [showFullReason, setShowFullReason] = useState(false);

  const getStatusBadge = (resolution: string) => {
    switch (resolution) {
      case "PENDING":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">⏳ Pending</span>;
      case "REFUNDED":
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">💰 Refunded</span>;
      case "RELEASED":
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">✅ Released</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">{resolution}</span>;
    }
  };

  const truncateReason = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const displayReason = showFullReason
    ? dispute.reason
    : truncateReason(dispute.reason, 100);

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
          {/* Customer */}
          <div className="flex items-center gap-2">
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
            <span className="text-sm text-gray-600">{dispute.job.customer.name}</span>
          </div>

          <span className="text-gray-400">vs</span>

          {/* Fixer */}
          <div className="flex items-center gap-2">
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
            <span className="text-sm text-gray-600">{dispute.job.fixer.name}</span>
          </div>
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

        {/* Admin Notes (if resolved) */}
        {dispute.resolution !== "PENDING" && dispute.adminNotes && (
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
          {isAdmin && dispute.resolution === "PENDING" && (
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
