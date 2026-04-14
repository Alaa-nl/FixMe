"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter((conv) =>
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getMessagePreview = (msg: Conversation["lastMessage"]) => {
    if (!msg) return "";
    if (!msg.type || msg.type === "TEXT" || msg.type === "PHOTO") {
      return truncateText(msg.content, 40);
    }
    // System message previews
    const metadata = msg.metadata || {};
    const previews: Record<string, string> = {
      OFFER_MADE: `Offer: €${metadata.price ?? ""}`,
      OFFER_ACCEPTED: "Offer accepted",
      OFFER_REJECTED: "Offer declined",
      OFFER_WITHDRAWN: "Offer withdrawn",
      COUNTER_OFFER: `Counter: €${metadata.counterPrice ?? ""}`,
      COUNTER_ACCEPTED: "Counter-offer accepted",
      COUNTER_REJECTED: "Counter-offer declined",
      JOB_SCHEDULED: "Job scheduled",
      JOB_STARTED: "Job started",
      JOB_COMPLETED: "Job completed",
      JOB_CANCELLED: "Job cancelled",
      PAYMENT_HELD: `€${metadata.amount ?? ""} held`,
      PAYMENT_RELEASED: `€${metadata.amount ?? ""} released`,
      PAYMENT_REFUNDED: `€${metadata.amount ?? ""} refunded`,
      DISPUTE_OPENED: "Dispute opened",
      DISPUTE_RESOLVED: "Dispute resolved",
      REVIEW_LEFT: `Review: ${"★".repeat(Number(metadata.rating ?? 0))}`,
      SYSTEM: truncateText(msg.content, 40),
    };
    return previews[msg.type] || truncateText(msg.content, 40);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MessageCircle className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No messages yet
            </h3>
            <p className="text-gray-600 text-sm">
              When you make or receive an offer, you can chat here.
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="block border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="p-4 flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {conv.otherUser.avatarUrl ? (
                    <img
                      src={conv.otherUser.avatarUrl}
                      alt={conv.otherUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                      {conv.otherUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {conv.otherUser.name}
                    </h3>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {timeAgo(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-1 truncate">
                    {conv.repairRequest.title}
                  </p>

                  <div className="flex items-center justify-between">
                    {conv.lastMessage && (
                      <p className={`text-sm truncate ${conv.lastMessage.isSystemMessage ? "text-gray-400 italic" : "text-gray-600"}`}>
                        {getMessagePreview(conv.lastMessage)}
                      </p>
                    )}
                    {conv.unreadCount > 0 && (
                      <div className="flex-shrink-0 ml-2 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
