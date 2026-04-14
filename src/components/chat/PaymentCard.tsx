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
  bg: string;
  border: string;
  label: string;
  amountColor: string;
}> = {
  PAYMENT_HELD: {
    icon: Shield,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Payment Held in Escrow",
    amountColor: "text-amber-700",
  },
  PAYMENT_RELEASED: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Payment Released",
    amountColor: "text-emerald-700",
  },
  PAYMENT_REFUNDED: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Payment Refunded",
    amountColor: "text-red-700",
  },
};

export default function PaymentCard({ type, metadata, createdAt }: PaymentCardProps) {
  const config = configs[type] || configs.PAYMENT_HELD;
  const Icon = config.icon;

  return (
    <div className="flex justify-center my-3">
      <div className={`w-[70%] max-w-xs border ${config.border} rounded-xl overflow-hidden ${config.bg}`}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
          <div className="flex-1">
            <p className="text-xs text-gray-500">{config.label}</p>
            <p className={`text-lg font-bold ${config.amountColor}`}>
              €{metadata.amount?.toFixed(2) ?? "0.00"}
            </p>
          </div>
        </div>
        <div className="px-4 py-1.5 border-t border-gray-100/50">
          <span className="text-[10px] text-gray-400">{timeAgo(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
