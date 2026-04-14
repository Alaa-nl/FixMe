import { timeAgo } from "@/lib/utils";
import { Shield, CheckCircle, AlertTriangle } from "lucide-react";

interface PaymentCardProps {
  type: string;
  metadata: {
    amount?: number;
    fixerPayout?: number;
    paymentId?: string;
  };
  createdAt: Date | string;
}

const configs: Record<string, {
  icon: typeof Shield;
  color: string;
  iconBg: string;
  bg: string;
  border: string;
  label: string;
  amountColor: string;
}> = {
  PAYMENT_HELD: {
    icon: Shield,
    color: "text-amber-600",
    iconBg: "bg-amber-100",
    bg: "bg-gradient-to-br from-amber-50/80 to-white",
    border: "border-amber-200/60",
    label: "Payment Held in Escrow",
    amountColor: "text-amber-700",
  },
  PAYMENT_RELEASED: {
    icon: CheckCircle,
    color: "text-emerald-600",
    iconBg: "bg-emerald-100",
    bg: "bg-gradient-to-br from-emerald-50/80 to-white",
    border: "border-emerald-200/60",
    label: "Payment Released",
    amountColor: "text-emerald-700",
  },
  PAYMENT_REFUNDED: {
    icon: AlertTriangle,
    color: "text-red-500",
    iconBg: "bg-red-100",
    bg: "bg-gradient-to-br from-red-50/80 to-white",
    border: "border-red-200/60",
    label: "Payment Refunded",
    amountColor: "text-red-600",
  },
};

export default function PaymentCard({ type, metadata, createdAt }: PaymentCardProps) {
  const config = configs[type] || configs.PAYMENT_HELD;
  const Icon = config.icon;

  return (
    <div className="flex justify-center my-4">
      <div className={`w-[75%] max-w-xs border ${config.border} rounded-2xl overflow-hidden ${config.bg} shadow-card`}>
        <div className="px-5 py-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{config.label}</p>
            <p className={`text-xl font-display font-bold ${config.amountColor} mt-0.5`}>
              €{metadata.amount?.toFixed(2) ?? "0.00"}
            </p>
          </div>
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
