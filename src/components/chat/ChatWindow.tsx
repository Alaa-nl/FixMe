"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Send, Paperclip, X } from "lucide-react";
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
  sending?: boolean;
  failed?: boolean;
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
  hasMore?: boolean;
}

interface ChatWindowProps {
  conversationId: string;
}

// Cache for storing conversation data
const conversationCache = new Map<string, { data: ConversationData; messages: Message[]; timestamp: number }>();

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const { data: session } = useSession();
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages on mount - check cache first
  useEffect(() => {
    const cached = conversationCache.get(conversationId);
    if (cached && Date.now() - cached.timestamp < 30000) {
      // Use cache if less than 30 seconds old
      setConversationData(cached.data);
      setMessages(cached.messages);
      setIsLoading(false);
      // Fetch fresh data in background
      fetchMessages(true);
    } else {
      fetchMessages();
    }
  }, [conversationId]);

  // Poll for new messages - 2 seconds when active, 10 seconds when tab hidden
  useEffect(() => {
    const getPollingInterval = () => {
      return document.hidden ? 10000 : 2000;
    };

    let interval = setInterval(() => {
      fetchMessages(true); // silent fetch
    }, getPollingInterval());

    const handleVisibilityChange = () => {
      clearInterval(interval);
      interval = setInterval(() => {
        fetchMessages(true);
      }, getPollingInterval());

      // Fetch immediately when tab becomes visible
      if (!document.hidden) {
        fetchMessages(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
        setHasMore(data.hasMore || false);

        // Update cache
        conversationCache.set(conversationId, {
          data,
          messages: data.messages,
          timestamp: Date.now(),
        });

        // Mark related notifications as read and refresh unread counts
        if (!silent) {
          // Mark notifications related to this conversation as read
          fetch(
            `/api/notifications/mark-read-conversation?conversationId=${conversationId}`,
            { method: "PATCH" }
          ).catch((err) => console.error("Error marking notifications as read:", err));

          // Refresh unread counts immediately (messages are marked as read by API)
          if (typeof window !== "undefined") {
            // Use setTimeout to avoid blocking
            setTimeout(() => {
              if ((window as any).refreshUnreadCount) {
                (window as any).refreshUnreadCount();
              }
              if ((window as any).refreshNotifications) {
                (window as any).refreshNotifications();
              }
            }, 100);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore || messages.length === 0) return;

    setIsLoadingMore(true);
    try {
      const oldestMessageId = messages[0].id;
      const res = await fetch(
        `/api/messages/${conversationId}?before=${oldestMessageId}`
      );
      if (res.ok) {
        const data: ConversationData = await res.json();
        setMessages((prev) => [...data.messages, ...prev]);
        setHasMore(data.hasMore || false);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Maximum size is 10MB.");
      return;
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only JPG, PNG, GIF, WEBP, MP4, and MOV are allowed.");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!newMessage.trim() && !selectedFile) || isSending) return;

    const messageContent = newMessage.trim() || "";
    let photoUrl: string | null = null;

    setIsSending(true);

    // Upload file if selected
    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          photoUrl = uploadData.url;
        } else {
          alert("Failed to upload file");
          setIsSending(false);
          setIsUploading(false);
          return;
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file");
        setIsSending(false);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    setNewMessage("");
    handleCancelFile();

    // Create optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      photoUrl,
      createdAt: new Date().toISOString(),
      read: false,
      sending: true,
      sender: {
        id: session?.user?.id || "",
        name: session?.user?.name || "",
        avatarUrl: session?.user?.avatarUrl || null,
      },
    };

    // Add optimistic message immediately
    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          content: messageContent,
          photoUrl,
        }),
      });

      if (res.ok) {
        const message = await res.json();
        // Replace optimistic message with real message
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? message : msg))
        );
      } else {
        // Mark message as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, sending: false, failed: true } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Mark message as failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, sending: false, failed: true } : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleRetryMessage = async (messageId: string, content: string) => {
    // Remove the failed message
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

    // Resend as a new message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content,
      photoUrl: null,
      createdAt: new Date().toISOString(),
      read: false,
      sending: true,
      sender: {
        id: session?.user?.id || "",
        name: session?.user?.name || "",
        avatarUrl: session?.user?.avatarUrl || null,
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          content,
        }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? message : msg))
        );
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, sending: false, failed: true } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, sending: false, failed: true } : msg
        )
      );
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
        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              onClick={loadMoreMessages}
              disabled={isLoadingMore}
              className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}

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
                onRetry={
                  message.failed
                    ? () => handleRetryMessage(message.id, message.content)
                    : undefined
                }
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4 fixed bottom-16 md:bottom-0 left-0 right-0 md:relative">
        {/* File Preview */}
        {filePreview && (
          <div className="mb-3 relative inline-block">
            <div className="relative">
              {selectedFile?.type.startsWith("image/") ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-w-xs max-h-40 rounded-lg border-2 border-gray-300"
                />
              ) : (
                <video
                  src={filePreview}
                  className="max-w-xs max-h-40 rounded-lg border-2 border-gray-300"
                  controls
                />
              )}
              <button
                type="button"
                onClick={handleCancelFile}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="text-white text-sm">Uploading...</div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            className="hidden"
          />

          {/* Attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-primary transition-colors"
            disabled={isSending || isUploading}
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
            disabled={isUploading}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
          >
            {isSending || isUploading ? (
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
