import { timeAgo } from "@/lib/utils";
import { Clock, Play, CheckCircle, XCircle, CalendarCheck } from "lucide-react";

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
}

const configs: Record<string, {
  icon: typeof Clock;
  color: string;
  bg: string;
  border: string;
  label: string;
}> = {
  JOB_SCHEDULED: {
    icon: CalendarCheck,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    label: "Job Scheduled",
  },
  JOB_STARTED: {
    icon: Play,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Job Started",
  },
  JOB_COMPLETED: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Job Completed",
  },
  JOB_CANCELLED: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Job Cancelled",
  },
};

export default function JobStatusCard({ type, metadata, createdAt }: JobStatusCardProps) {
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

  return (
    <div className="flex justify-center my-3">
      <div className={`w-[75%] max-w-xs border ${config.border} rounded-xl overflow-hidden ${config.bg}`}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
            {metadata.scheduledAt && type === "JOB_SCHEDULED" && (
              <p className="text-xs text-gray-500">{formatDate(metadata.scheduledAt)}</p>
            )}
            {metadata.startedAt && type === "JOB_STARTED" && (
              <p className="text-xs text-gray-500">{formatDate(metadata.startedAt)}</p>
            )}
            {metadata.completedAt && type === "JOB_COMPLETED" && (
              <p className="text-xs text-gray-500">{formatDate(metadata.completedAt)}</p>
            )}
            {metadata.agreedPrice && type === "JOB_SCHEDULED" && (
              <p className="text-xs text-gray-500">Agreed: €{metadata.agreedPrice}</p>
            )}
          </div>
        </div>
        <div className="px-4 py-1.5 border-t border-gray-100/50">
          <span className="text-[10px] text-gray-400">{timeAgo(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
