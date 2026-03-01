"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Send, Paperclip } from "lucide-react";
import ChatBubble from "./ChatBubble";

interface Message {
  id: string;
  content: string;
  photoUrl: string | null;
  createdAt: Date | string;
  read: boolean;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface ConversationData {
  conversation: {
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
  };
  messages: Message[];
}

interface ChatWindowProps {
  conversationId: string;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const { data: session } = useSession();
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageAreaRef = useRef<HTMLDivElement>(null);

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(true); // silent fetch
    }, 5000);

    return () => clearInterval(interval);
  }, [conversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);

      const res = await fetch(`/api/messages/${conversationId}`);
      if (res.ok) {
        const data: ConversationData = await res.json();
        setConversationData(data);
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          content: newMessage.trim(),
        }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
        scrollToBottom();
      } else {
        alert("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateLabel = "";
      if (date.toDateString() === today.toDateString()) {
        dateLabel = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateLabel = "Yesterday";
      } else {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        dateLabel = `${weekdays[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
      }

      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(message);
    });

    return groups;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (!conversationData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Conversation not found</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3 flex items-center gap-3">
        <Link href="/messages" className="md:hidden">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>

        {conversationData.conversation.otherUser.avatarUrl ? (
          <img
            src={conversationData.conversation.otherUser.avatarUrl}
            alt={conversationData.conversation.otherUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
            {conversationData.conversation.otherUser.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-800 truncate">
            {conversationData.conversation.otherUser.name}
          </h2>
          <Link
            href={`/request/${conversationData.conversation.repairRequest.id}`}
            className="text-xs text-primary hover:underline truncate block"
          >
            {conversationData.conversation.repairRequest.title}
          </Link>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messageAreaRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 pb-24 md:pb-4"
      >
        {Object.entries(messageGroups).map(([dateLabel, msgs]) => (
          <div key={dateLabel}>
            {/* Date Divider */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                {dateLabel}
              </div>
            </div>

            {/* Messages */}
            {msgs.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
                isOwn={message.sender.id === session?.user?.id}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4 fixed bottom-16 md:bottom-0 left-0 right-0 md:relative">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          {/* Attach button (future feature) */}
          <button
            type="button"
            className="flex-shrink-0 p-2 text-gray-500 hover:text-primary transition-colors"
            disabled
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-primary max-h-32"
            style={{
              minHeight: "2.5rem",
              maxHeight: "8rem",
            }}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
          >
            {isSending ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
