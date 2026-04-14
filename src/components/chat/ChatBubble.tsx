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

    // Default: TEXT and PHOTO — original bubble behavior
    default:
      return (
        <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
          <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
            {/* Photo if present */}
            {message.photoUrl && (
              <div className="mb-2">
                <img
                  src={message.photoUrl}
                  alt="Attachment"
                  className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.photoUrl || "", "_blank")}
                />
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`rounded-2xl px-4 py-2 ${
                message.failed
                  ? "bg-red-100 text-red-800 border border-red-300"
                  : isOwn
                  ? "bg-primary text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>

            {/* Timestamp and read status */}
            <div className="flex items-center gap-2 mt-1 px-2">
              <span className="text-xs text-gray-500">{timeAgo(message.createdAt)}</span>
              {isOwn && message.sending && (
                <span className="text-xs text-gray-400">Sending...</span>
              )}
              {isOwn && message.failed && onRetry && (
                <button
                  onClick={onRetry}
                  className="text-xs text-red-600 hover:underline font-medium"
                >
                  Retry
                </button>
              )}
              {isOwn && !message.sending && !message.failed && message.read && (
                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
              )}
              {isOwn && !message.sending && !message.failed && !message.read && (
                <Check className="w-3.5 h-3.5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      );
  }
}
