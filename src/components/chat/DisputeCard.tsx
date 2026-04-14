import { timeAgo } from "@/lib/utils";
import { AlertTriangle, Shield } from "lucide-react";
import Link from "next/link";

interface DisputeCardProps {
  type: string;
  metadata: {
    disputeId?: string;
    reason?: string;
    resolution?: string;
    refundAmount?: number | null;
    jobId?: string;
  };
  createdAt: Date | string;
}

export default function DisputeCard({ type, metadata, createdAt }: DisputeCardProps) {
  const isOpened = type === "DISPUTE_OPENED";
  const Icon = isOpened ? AlertTriangle : Shield;
  const color = isOpened ? "text-red-600" : "text-blue-600";
  const bg = isOpened ? "bg-red-50" : "bg-blue-50";
  const border = isOpened ? "border-red-200" : "border-blue-200";

  const resolutionLabel = () => {
    if (!metadata.resolution) return null;
    const labels: Record<string, string> = {
      REFUNDED: "Full refund issued",
      PARTIAL_REFUND: `Partial refund of €${metadata.refundAmount?.toFixed(2) ?? "0"} issued`,
      RELEASED: "Payment released to fixer",
    };
    return labels[metadata.resolution] ?? metadata.resolution;
  };

  return (
    <div className="flex justify-center my-3">
      <div className={`w-[75%] max-w-xs border ${border} rounded-xl overflow-hidden ${bg}`}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className={`text-sm font-semibold ${color}`}>
              {isOpened ? "Dispute Opened" : "Dispute Resolved"}
            </span>
          </div>
          {isOpened && metadata.reason && (
            <p className="text-sm text-gray-600 line-clamp-2">{metadata.reason}</p>
          )}
          {!isOpened && (
            <p className="text-sm text-gray-600">{resolutionLabel()}</p>
          )}
          {metadata.disputeId && (
            <Link
              href={`/disputes/${metadata.disputeId}`}
              className="inline-block mt-2 text-xs text-blue-600 hover:underline font-medium"
            >
              View details
            </Link>
          )}
        </div>
        <div className="px-4 py-1.5 border-t border-gray-100/50">
          <span className="text-[10px] text-gray-400">{timeAgo(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
