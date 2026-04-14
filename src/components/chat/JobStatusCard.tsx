"use client";

import { useState } from "react";
import { timeAgo } from "@/lib/utils";
import {
  Clock,
  Play,
  CheckCircle,
  XCircle,
  CalendarCheck,
  Loader2,
} from "lucide-react";

interface JobStatusCardProps {
  type: string;
  metadata: {
    jobId?: string;
    fixerName?: string;
    startedAt?: string;
    completedAt?: string;
    scheduledAt?: string | null;
    agreedPrice?: number;
  };
  createdAt: Date | string;
  currentUserId?: string;
  isCustomer?: boolean;
  isFixer?: boolean;
  jobStatus?: string;
  onAction?: (action: string, data: Record<string, unknown>) => void;
}

const configs: Record<
  string,
  {
    icon: typeof Clock;
    color: string;
    iconBg: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  JOB_SCHEDULED: {
    icon: CalendarCheck,
    color: "text-secondary-600",
    iconBg: "bg-secondary-100",
    bg: "bg-gradient-to-br from-secondary-50 to-white",
    border: "border-secondary-200",
    label: "Job Scheduled",
  },
  JOB_STARTED: {
    icon: Play,
    color: "text-amber-600",
    iconBg: "bg-amber-100",
    bg: "bg-gradient-to-br from-amber-50 to-white",
    border: "border-amber-200",
    label: "Repair In Progress",
  },
  JOB_COMPLETED: {
    icon: CheckCircle,
    color: "text-emerald-600",
    iconBg: "bg-emerald-100",
    bg: "bg-gradient-to-br from-emerald-50 to-white",
    border: "border-emerald-200",
    label: "Job Completed",
  },
  JOB_CANCELLED: {
    icon: XCircle,
    color: "text-red-500",
    iconBg: "bg-red-100",
    bg: "bg-gradient-to-br from-red-50 to-white",
    border: "border-red-200",
    label: "Job Cancelled",
  },
};

export default function JobStatusCard({
  type,
  metadata,
  createdAt,
  isCustomer = false,
  isFixer = false,
  jobStatus,
  onAction,
}: JobStatusCardProps) {
  const [isActioning, setIsActioning] = useState(false);
  const config = configs[type] || configs.JOB_SCHEDULED;
  const Icon = config.icon;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-NL", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAction = (action: string) => {
    if (!onAction || !metadata.jobId) return;
    setIsActioning(true);
    onAction(action, { jobId: metadata.jobId });
  };

  // Determine which actions to show based on job status and user role
  const showStartJob = type === "JOB_SCHEDULED" && isFixer && jobStatus === "SCHEDULED";
  const showCancelJob = type === "JOB_SCHEDULED" && jobStatus === "SCHEDULED";
  const showCompleteJob = type === "JOB_STARTED" && isCustomer && jobStatus === "IN_PROGRESS";
  const hasActions = showStartJob || showCancelJob || showCompleteJob;

  return (
    <div className="flex justify-center my-4">
      <div
        className={`w-[85%] max-w-sm border ${config.border} rounded-2xl overflow-hidden ${config.bg} shadow-card`}
      >
        <div className="px-5 py-4 flex items-center gap-4">
          <div
            className={`w-11 h-11 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold font-display ${config.color}`}>
              {config.label}
            </p>
            {metadata.scheduledAt && type === "JOB_SCHEDULED" && (
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(metadata.scheduledAt)}
              </p>
            )}
            {metadata.startedAt && type === "JOB_STARTED" && (
              <p className="text-xs text-gray-500 mt-0.5">
                Started {formatDate(metadata.startedAt)}
              </p>
            )}
            {metadata.completedAt && type === "JOB_COMPLETED" && (
              <p className="text-xs text-gray-500 mt-0.5">
                Completed {formatDate(metadata.completedAt)}
              </p>
            )}
            {metadata.agreedPrice && type === "JOB_SCHEDULED" && (
              <p className="text-xs font-medium text-gray-600 mt-0.5">
                Agreed price: €{metadata.agreedPrice}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {hasActions && (
          <div className="px-5 py-3 border-t border-gray-100/80 flex gap-2">
            {showStartJob && (
              <button
                onClick={() => handleAction("start-job")}
                disabled={isActioning}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 shadow-sm"
              >
                {isActioning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Start Job
              </button>
            )}
            {showCompleteJob && (
              <button
                onClick={() => handleAction("complete-job")}
                disabled={isActioning}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm"
              >
                {isActioning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Mark Complete
              </button>
            )}
            {showCancelJob && (
              <button
                onClick={() => handleAction("cancel-job")}
                disabled={isActioning}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
              >
                {isActioning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancel
              </button>
            )}
          </div>
        )}

        <div className="px-5 py-2 border-t border-gray-100/50">
          <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
            {timeAgo(createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
