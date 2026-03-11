import { Bot, Headset } from "lucide-react";

interface SupportMessageProps {
  message: {
    id: string;
    content: string;
    senderType: "USER" | "AI" | "ADMIN";
    createdAt: Date | string;
  };
  sending?: boolean;
  failed?: boolean;
  onRetry?: () => void;
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function SupportMessage({
  message,
  sending,
  failed,
  onRetry,
}: SupportMessageProps) {
  const isUser = message.senderType === "USER";
  const isAI = message.senderType === "AI";
  const isAdmin = message.senderType === "ADMIN";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`flex gap-2 max-w-[85%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar icon for AI / Admin */}
        {!isUser && (
          <div
            className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 ${
              isAI
                ? "bg-gray-200 text-gray-600"
                : "bg-secondary text-white"
            }`}
          >
            {isAI ? (
              <Bot className="w-4 h-4" />
            ) : (
              <Headset className="w-4 h-4" />
            )}
          </div>
        )}

        {/* Message bubble */}
        <div>
          {/* Sender label */}
          {!isUser && (
            <p className="text-[10px] text-gray-400 mb-0.5 px-1">
              {isAI ? "AI Assistant" : "Support Agent"}
            </p>
          )}

          <div
            className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
              failed
                ? "bg-red-100 text-red-800 border border-red-300"
                : isUser
                ? "bg-primary text-white rounded-br-sm"
                : isAdmin
                ? "bg-secondary text-white rounded-bl-sm"
                : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>

          {/* Timestamp + status */}
          <div
            className={`flex items-center gap-2 mt-0.5 px-1 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            <span className="text-[10px] text-gray-400">
              {formatTime(message.createdAt)}
            </span>
            {sending && (
              <span className="text-[10px] text-gray-400">Sending...</span>
            )}
            {failed && onRetry && (
              <button
                onClick={onRetry}
                className="text-[10px] text-red-600 hover:underline font-medium"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
