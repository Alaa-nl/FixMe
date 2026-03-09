"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Headset, Clock, CheckCircle, MessageSquare } from "lucide-react";

interface SupportConversation {
  id: string;
  userName: string;
  userType: "VISITOR" | "CUSTOMER" | "FIXER";
  userCity: string | null;
  status: "ESCALATED" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
  lastMessage: {
    content: string;
    createdAt: string;
    senderType: string;
  } | null;
  messageCount: number;
  unreadCount: number;
}

function timeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const userTypeBadge: Record<string, { label: string; className: string }> = {
  VISITOR: { label: "Visitor", className: "bg-gray-100 text-gray-600" },
  CUSTOMER: { label: "Customer", className: "bg-blue-100 text-blue-700" },
  FIXER: { label: "Fixer", className: "bg-green-100 text-green-700" },
};

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "escalated" | "resolved">("all");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/admin/support");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching support conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = conversations.filter((conv) => {
    if (filter === "all") return true;
    if (filter === "escalated") return conv.status === "ESCALATED";
    if (filter === "resolved") return conv.status === "RESOLVED";
    return true;
  });

  const escalatedCount = conversations.filter(
    (c) => c.status === "ESCALATED"
  ).length;
  const resolvedCount = conversations.filter(
    (c) => c.status === "RESOLVED"
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Headset className="w-7 h-7 text-[#1B4965]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Support Conversations
            </h1>
            <p className="text-sm text-gray-500">
              {escalatedCount} awaiting reply &middot; {resolvedCount} resolved
            </p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "all" as const, label: "All", count: conversations.length },
          { key: "escalated" as const, label: "Open", count: escalatedCount },
          { key: "resolved" as const, label: "Resolved", count: resolvedCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-[#1B4965] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Conversation list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-1">
            No conversations yet
          </h3>
          <p className="text-gray-500 text-sm">
            Escalated support conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          {filtered.map((conv) => {
            const badge = userTypeBadge[conv.userType];
            const hasUnread = conv.unreadCount > 0;

            return (
              <Link
                key={conv.id}
                href={`/admin/support/${conv.id}`}
                className={`flex items-start gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                  hasUnread ? "border-l-4 border-l-[#FF6B35]" : ""
                }`}
              >
                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 truncate">
                      {conv.userName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    {conv.userCity && (
                      <span className="text-xs text-gray-400">
                        {conv.userCity}
                      </span>
                    )}
                  </div>

                  {/* Last message preview */}
                  {conv.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage.senderType === "ADMIN" && (
                        <span className="text-[#1B4965] font-medium">
                          You:{" "}
                        </span>
                      )}
                      {conv.lastMessage.content.length > 80
                        ? conv.lastMessage.content.substring(0, 80) + "..."
                        : conv.lastMessage.content}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(conv.updatedAt)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {conv.messageCount} messages
                    </span>
                  </div>
                </div>

                {/* Right side: status + unread */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {conv.status === "ESCALATED" ? (
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      Open
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Resolved
                    </span>
                  )}

                  {hasUnread && (
                    <span className="w-5 h-5 rounded-full bg-[#FF6B35] text-white text-[10px] font-bold flex items-center justify-center">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
