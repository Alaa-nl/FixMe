import { timeAgo } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

interface ChatBubbleProps {
  message: {
    id: string;
    content: string;
    photoUrl: string | null;
    createdAt: Date | string;
    read: boolean;
    sending?: boolean;
    failed?: boolean;
  };
  isOwn: boolean;
  onRetry?: () => void;
}

export default function ChatBubble({ message, isOwn, onRetry }: ChatBubbleProps) {
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
