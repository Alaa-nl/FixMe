"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import { Search, MessageCircle } from "lucide-react";

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  repairRequest: {
    id: string;
    title: string;
  };
  lastMessage: {
    content: string;
    type?: string;
    metadata?: Record<string, unknown> | null;
    isSystemMessage?: boolean;
    createdAt: Date | string;
  } | null;
  unreadCount: number;
}

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter((conv) =>
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.repairRequest.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        setFilteredConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessagePreview = (msg: Conversation["lastMessage"]) => {
    if (!msg) return "";
    if (!msg.type || msg.type === "TEXT" || msg.type === "PHOTO") {
      return msg.content.length > 45 ? msg.content.substring(0, 45) + "..." : msg.content;
    }
    const metadata = msg.metadata || {};
    const previews: Record<string, string> = {
      OFFER_MADE: `💰 Offer: €${metadata.price ?? ""}`,
      OFFER_ACCEPTED: "✓ Offer accepted",
      OFFER_REJECTED: "✗ Offer declined",
      OFFER_WITHDRAWN: "↩ Offer withdrawn",
      COUNTER_OFFER: `↔ Counter: €${metadata.counterPrice ?? ""}`,
      COUNTER_ACCEPTED: "✓ Counter accepted",
      COUNTER_REJECTED: "✗ Counter declined",
      JOB_SCHEDULED: "📋 Job scheduled",
      JOB_STARTED: "▶ Job started",
      JOB_COMPLETED: "✓ Job completed",
      JOB_CANCELLED: "✗ Job cancelled",
      PAYMENT_HELD: `🔒 €${metadata.amount ?? ""} held`,
      PAYMENT_RELEASED: `✓ €${metadata.amount ?? ""} released`,
      PAYMENT_REFUNDED: `↩ €${metadata.amount ?? ""} refunded`,
      DISPUTE_OPENED: "⚠ Dispute opened",
      DISPUTE_RESOLVED: "✓ Dispute resolved",
      REVIEW_LEFT: `★ ${metadata.rating ?? ""}-star review`,
      SYSTEM: msg.content.length > 45 ? msg.content.substring(0, 45) + "..." : msg.content,
    };
    return previews[msg.type] || (msg.content.length > 45 ? msg.content.substring(0, 45) + "..." : msg.content);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="flex-1 p-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-40 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-display font-bold text-secondary-800 mb-3">
          Conversations
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or request..."
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-display font-bold text-gray-700 mb-1.5">
              No conversations yet
            </h3>
            <p className="text-sm text-gray-400 max-w-[200px] leading-relaxed">
              Conversations appear here when you make or receive an offer
            </p>
          </div>
        ) : (
          <div className="py-1">
            {filteredConversations.map((conv) => {
              const isActive = pathname === `/messages/${conv.id}`;
              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className={`block mx-2 mb-0.5 rounded-xl transition-all duration-150 ${
                    isActive
                      ? "bg-primary-50/70 border border-primary-100"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="p-3 flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {conv.otherUser.avatarUrl ? (
                        <img
                          src={conv.otherUser.avatarUrl}
                          alt={conv.otherUser.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                          {conv.otherUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white">
                          {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3
                          className={`text-sm truncate ${
                            conv.unreadCount > 0
                              ? "font-bold text-secondary-900"
                              : "font-semibold text-gray-800"
                          }`}
                        >
                          {conv.otherUser.name}
                        </h3>
                        {conv.lastMessage && (
                          <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2 tabular-nums">
                            {timeAgo(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-primary-600/80 mb-0.5 truncate font-medium">
                        {conv.repairRequest.title}
                      </p>

                      {conv.lastMessage && (
                        <p
                          className={`text-xs truncate ${
                            conv.lastMessage.isSystemMessage
                              ? "text-gray-400 italic"
                              : conv.unreadCount > 0
                              ? "text-gray-700 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {getMessagePreview(conv.lastMessage)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
