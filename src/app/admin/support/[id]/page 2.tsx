"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  Bot,
  Headset,
  User,
} from "lucide-react";

interface SupportMessage {
  id: string;
  content: string;
  senderType: "USER" | "AI" | "ADMIN";
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  userName: string;
  userType: "VISITOR" | "CUSTOMER" | "FIXER";
  userCity: string | null;
  status: "OPEN" | "ESCALATED" | "RESOLVED";
  createdAt: string;
  messages: SupportMessage[];
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    userType: string;
    city: string | null;
  } | null;
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(date: string): string {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// Group messages by date
function groupByDate(messages: SupportMessage[]) {
  const groups: Record<string, SupportMessage[]> = {};
  messages.forEach((msg) => {
    const label = formatDate(msg.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(msg);
  });
  return groups;
}

const senderIcons: Record<string, typeof Bot> = {
  USER: User,
  AI: Bot,
  ADMIN: Headset,
};

const senderLabels: Record<string, string> = {
  USER: "Customer",
  AI: "AI Assistant",
  ADMIN: "Admin",
};

export default function AdminSupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null
  );
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch conversation on mount
  useEffect(() => {
    fetchConversation();
  }, [id]);

  // Poll for new messages (2s active, 10s hidden) — same pattern as existing chat
  useEffect(() => {
    if (!conversation || conversation.status === "RESOLVED") return;

    const getPollingInterval = () => (document.hidden ? 10000 : 2000);

    let interval = setInterval(() => {
      fetchMessages();
    }, getPollingInterval());

    const handleVisibilityChange = () => {
      clearInterval(interval);
      interval = setInterval(() => {
        fetchMessages();
      }, getPollingInterval());
      if (!document.hidden) fetchMessages();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [conversation?.id, conversation?.status]);

  const fetchConversation = async () => {
    try {
      const res = await fetch(`/api/admin/support/${id}`);
      if (res.ok) {
        const data: ConversationDetail = await res.json();
        setConversation(data);
        setMessages(data.messages);
        requestAnimationFrame(() => scrollToBottom("instant"));
      } else {
        router.push("/admin/support");
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/admin/support/${id}`);
      if (res.ok) {
        const data: ConversationDetail = await res.json();
        setMessages(data.messages);
        if (data.status !== conversation?.status) {
          setConversation(data);
        }
      }
    } catch (error) {
      console.error("Error polling messages:", error);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = reply.trim();
    if (!content || isSending) return;

    setReply("");
    setIsSending(true);

    try {
      const res = await fetch(`/api/admin/support/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleResolve = async () => {
    if (isResolving) return;
    setIsResolving(true);

    try {
      const res = await fetch(`/api/admin/support/${id}/resolve`, {
        method: "PATCH",
      });

      if (res.ok) {
        // Refresh to get updated status and resolution message
        await fetchConversation();
      }
    } catch (error) {
      console.error("Error resolving conversation:", error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Conversation not found.</p>
      </div>
    );
  }

  const messageGroups = groupByDate(messages);
  const userTypeBadge: Record<string, string> = {
    VISITOR: "bg-gray-100 text-gray-600",
    CUSTOMER: "bg-blue-100 text-blue-700",
    FIXER: "bg-green-100 text-green-700",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/support"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-800">
                {conversation.userName}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  userTypeBadge[conversation.userType]
                }`}
              >
                {conversation.userType}
              </span>
              {conversation.status === "ESCALATED" && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-medium">
                  Open
                </span>
              )}
              {conversation.status === "RESOLVED" && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">
                  Resolved
                </span>
              )}
            </div>
            {conversation.user && (
              <p className="text-xs text-gray-500">
                {conversation.user.email}
                {conversation.userCity && ` · ${conversation.userCity}`}
              </p>
            )}
            {!conversation.user && conversation.userCity && (
              <p className="text-xs text-gray-500">{conversation.userCity}</p>
            )}
          </div>
        </div>

        {conversation.status !== "RESOLVED" && (
          <button
            onClick={handleResolve}
            disabled={isResolving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            {isResolving ? "Resolving..." : "Mark as resolved"}
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={messageAreaRef}
        className="flex-1 overflow-y-auto bg-white rounded-xl border p-4"
      >
        {Object.entries(messageGroups).map(([dateLabel, msgs]) => (
          <div key={dateLabel}>
            {/* Date divider */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                {dateLabel}
              </div>
            </div>

            {msgs.map((msg) => {
              const isUser = msg.senderType === "USER";
              const Icon = senderIcons[msg.senderType];

              return (
                <div
                  key={msg.id}
                  className={`flex ${
                    isUser ? "justify-end" : "justify-start"
                  } mb-3`}
                >
                  <div
                    className={`flex gap-2 max-w-[70%] ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                        isUser
                          ? "bg-primary text-white"
                          : msg.senderType === "AI"
                          ? "bg-gray-200 text-gray-600"
                          : "bg-secondary text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-400 mb-0.5 px-1">
                        {isUser
                          ? conversation.userName
                          : senderLabels[msg.senderType]}
                      </p>
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                          isUser
                            ? "bg-primary text-white rounded-br-sm"
                            : msg.senderType === "ADMIN"
                            ? "bg-secondary text-white rounded-bl-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 px-1">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply input */}
      {conversation.status !== "RESOLVED" && (
        <div className="mt-4">
          <form onSubmit={handleSendReply} className="flex items-end gap-3">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply..."
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-secondary text-sm max-h-32"
              style={{ minHeight: "2.75rem" }}
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!reply.trim() || isSending}
              className="flex-shrink-0 px-6 py-3 rounded-xl bg-secondary text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors text-sm font-medium"
            >
              {isSending ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Reply
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
