import { timeAgo } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import SystemMessage from "./SystemMessage";
import OfferMessageCard from "./OfferMessageCard";
import CounterOfferCard from "./CounterOfferCard";
import JobStatusCard from "./JobStatusCard";
import PaymentCard from "./PaymentCard";
import ReviewCard from "./ReviewCard";
import DisputeCard from "./DisputeCard";

interface ChatBubbleProps {
  message: {
    id: string;
    content: string;
    photoUrl: string | null;
    type?: string;
    metadata?: Record<string, unknown> | null;
    isSystemMessage?: boolean;
    createdAt: Date | string;
    read: boolean;
    sending?: boolean;
    failed?: boolean;
  };
  isOwn: boolean;
  currentUserId?: string;
  isCustomer?: boolean;
  isFixer?: boolean;
  onRetry?: () => void;
  onAction?: (action: string, data: Record<string, unknown>) => void;
}

export default function ChatBubble({
  message,
  isOwn,
  currentUserId,
  isCustomer = false,
  isFixer = false,
  onRetry,
  onAction,
}: ChatBubbleProps) {
  const type = message.type || "TEXT";
  const metadata = (message.metadata || {}) as Record<string, unknown>;
  const handleAction = onAction || (() => {});

  // Route to specialized card components based on message type
  switch (type) {
    case "OFFER_MADE":
      return (
        <OfferMessageCard
          metadata={metadata as any}
          createdAt={message.createdAt}
          currentUserId={currentUserId || ""}
          isCustomer={isCustomer}
          offerStatus={metadata.offerStatus as string | undefined}
          onAction={handleAction}
        />
      );

    case "COUNTER_OFFER":
      return (
        <CounterOfferCard
          metadata={metadata as any}
          createdAt={message.createdAt}
          currentUserId={currentUserId || ""}
          isFixer={isFixer}
          offerStatus={metadata.offerStatus as string | undefined}
          onAction={handleAction}
        />
      );

    case "JOB_SCHEDULED":
    case "JOB_STARTED":
    case "JOB_COMPLETED":
    case "JOB_CANCELLED":
      return (
        <JobStatusCard
          type={type}
          metadata={metadata as any}
          createdAt={message.createdAt}
          currentUserId={currentUserId}
          isCustomer={isCustomer}
          isFixer={isFixer}
          jobStatus={metadata.jobStatus as string | undefined}
          onAction={handleAction}
        />
      );

    case "PAYMENT_HELD":
    case "PAYMENT_RELEASED":
    case "PAYMENT_REFUNDED":
      return (
        <PaymentCard
          type={type}
          metadata={metadata as any}
          createdAt={message.createdAt}
        />
      );

    case "REVIEW_LEFT":
      return (
        <ReviewCard
          metadata={metadata as any}
          createdAt={message.createdAt}
        />
      );

    case "DISPUTE_OPENED":
    case "DISPUTE_RESOLVED":
      return (
        <DisputeCard
          type={type}
          metadata={metadata as any}
          createdAt={message.createdAt}
        />
      );

    case "OFFER_ACCEPTED":
    case "OFFER_REJECTED":
    case "OFFER_WITHDRAWN":
    case "COUNTER_ACCEPTED":
    case "COUNTER_REJECTED":
    case "APPOINTMENT_REMINDER":
    case "SYSTEM":
      return (
        <SystemMessage
          content={message.content}
          type={type}
          createdAt={message.createdAt}
        />
      );

    // Default: TEXT and PHOTO — refined bubble
    default:
      return (
        <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
          <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
            {message.photoUrl && (
              <div className="mb-1.5">
                <img
                  src={message.photoUrl}
                  alt="Attachment"
                  className="max-w-xs rounded-2xl cursor-pointer hover:opacity-90 transition-opacity shadow-card"
                  onClick={() => window.open(message.photoUrl || "", "_blank")}
                />
              </div>
            )}

            <div
              className={`rounded-2xl px-4 py-2.5 ${
                message.failed
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : isOwn
                  ? "bg-primary text-white rounded-br-md shadow-sm"
                  : "bg-white text-gray-800 rounded-bl-md border border-gray-100 shadow-card"
              }`}
            >
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
            </div>

            <div className="flex items-center gap-1.5 mt-1 px-1">
              <span className="text-[11px] text-gray-400">{timeAgo(message.createdAt)}</span>
              {isOwn && message.sending && (
                <span className="text-[11px] text-gray-300">Sending...</span>
              )}
              {isOwn && message.failed && onRetry && (
                <button
                  onClick={onRetry}
                  className="text-[11px] text-red-500 hover:underline font-semibold"
                >
                  Retry
                </button>
              )}
              {isOwn && !message.sending && !message.failed && message.read && (
                <CheckCheck className="w-3.5 h-3.5 text-primary-400" />
              )}
              {isOwn && !message.sending && !message.failed && !message.read && (
                <Check className="w-3.5 h-3.5 text-gray-300" />
              )}
            </div>
          </div>
        </div>
      );
  }
}
