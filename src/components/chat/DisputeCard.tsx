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
  const color = isOpened ? "text-red-500" : "text-secondary-600";
  const iconBg = isOpened ? "bg-red-100" : "bg-secondary-100";
  const bg = isOpened
    ? "bg-gradient-to-br from-red-50/80 to-white"
    : "bg-gradient-to-br from-secondary-50/80 to-white";
  const border = isOpened ? "border-red-200/60" : "border-secondary-200/60";

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
    <div className="flex justify-center my-4">
      <div className={`w-[78%] max-w-xs border ${border} rounded-2xl overflow-hidden ${bg} shadow-card`}>
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className={`text-sm font-bold font-display ${color}`}>
              {isOpened ? "Dispute Opened" : "Dispute Resolved"}
            </span>
          </div>
          {isOpened && metadata.reason && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-2">{metadata.reason}</p>
          )}
          {!isOpened && (
            <p className="text-sm text-gray-600 leading-relaxed mb-2">{resolutionLabel()}</p>
          )}
          {metadata.disputeId && (
            <Link
              href={`/disputes/${metadata.disputeId}`}
              className="inline-flex items-center text-xs text-primary font-semibold hover:underline"
            >
              View details →
            </Link>
          )}
        </div>
        <div className="px-5 py-2 border-t border-gray-100/50">
          <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase tabular-nums">
            {timeAgo(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
