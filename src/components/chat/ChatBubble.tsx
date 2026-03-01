import { timeAgo } from "@/lib/utils";

interface ChatBubbleProps {
  message: {
    id: string;
    content: string;
    photoUrl: string | null;
    createdAt: Date | string;
    read: boolean;
  };
  isOwn: boolean;
}

export default function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {/* Photo if present */}
        {message.photoUrl && (
          <div className="mb-2">
            <img
              src={message.photoUrl}
              alt="Attachment"
              className="max-w-xs rounded-lg"
            />
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? "bg-primary text-white rounded-br-sm"
              : "bg-gray-100 text-gray-800 rounded-bl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Timestamp and read status */}
        <div className="flex items-center gap-1 mt-1 px-2">
          <span className="text-xs text-gray-500">{timeAgo(message.createdAt)}</span>
          {isOwn && message.read && (
            <span className="text-xs text-blue-500">✓✓</span>
          )}
          {isOwn && !message.read && (
            <span className="text-xs text-gray-400">✓</span>
          )}
        </div>
      </div>
    </div>
  );
}
