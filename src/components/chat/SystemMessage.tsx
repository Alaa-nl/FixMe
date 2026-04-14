import { timeAgo } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Star,
  Bell,
  Info,
} from "lucide-react";

interface SystemMessageProps {
  content: string;
  type: string;
  createdAt: Date | string;
}

const iconMap: Record<string, { icon: typeof Info; color: string; bg: string; border: string }> = {
  OFFER_ACCEPTED: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50/80", border: "border-emerald-200/50" },
  OFFER_REJECTED: { icon: XCircle, color: "text-red-400", bg: "bg-red-50/80", border: "border-red-200/50" },
  OFFER_WITHDRAWN: { icon: XCircle, color: "text-gray-400", bg: "bg-gray-50/80", border: "border-gray-200/50" },
  COUNTER_ACCEPTED: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50/80", border: "border-emerald-200/50" },
  COUNTER_REJECTED: { icon: XCircle, color: "text-red-400", bg: "bg-red-50/80", border: "border-red-200/50" },
  JOB_SCHEDULED: { icon: Clock, color: "text-secondary-500", bg: "bg-secondary-50/80", border: "border-secondary-200/50" },
  JOB_STARTED: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50/80", border: "border-amber-200/50" },
  JOB_COMPLETED: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50/80", border: "border-emerald-200/50" },
  JOB_CANCELLED: { icon: XCircle, color: "text-red-400", bg: "bg-red-50/80", border: "border-red-200/50" },
  PAYMENT_HELD: { icon: Shield, color: "text-amber-500", bg: "bg-amber-50/80", border: "border-amber-200/50" },
  PAYMENT_RELEASED: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50/80", border: "border-emerald-200/50" },
  PAYMENT_REFUNDED: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-50/80", border: "border-red-200/50" },
  DISPUTE_OPENED: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50/80", border: "border-red-200/50" },
  DISPUTE_RESOLVED: { icon: Shield, color: "text-secondary-500", bg: "bg-secondary-50/80", border: "border-secondary-200/50" },
  REVIEW_LEFT: { icon: Star, color: "text-amber-500", bg: "bg-amber-50/80", border: "border-amber-200/50" },
  APPOINTMENT_REMINDER: { icon: Bell, color: "text-secondary-500", bg: "bg-secondary-50/80", border: "border-secondary-200/50" },
  SYSTEM: { icon: Info, color: "text-gray-400", bg: "bg-gray-50/80", border: "border-gray-200/50" },
};

export default function SystemMessage({ content, type, createdAt }: SystemMessageProps) {
  const config = iconMap[type] || iconMap.SYSTEM;
  const Icon = config.icon;

  return (
    <div className="flex justify-center my-4">
      <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full ${config.bg} border ${config.border} max-w-[85%] backdrop-blur-sm`}>
        <Icon className={`w-3.5 h-3.5 ${config.color} flex-shrink-0`} />
        <span className="text-xs text-gray-600 font-medium">{content}</span>
        <span className="text-[10px] text-gray-400 flex-shrink-0 tabular-nums">{timeAgo(createdAt)}</span>
      </div>
    </div>
  );
}
