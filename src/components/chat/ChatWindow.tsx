"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Send, Paperclip, X, ChevronDown } from "lucide-react";
import ChatBubble from "./ChatBubble";

interface Message {
  id: string;
  content: string;
  photoUrl: string | null;
  type?: string;
  metadata?: Record<string, unknown> | null;
  isSystemMessage?: boolean;
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
    customerId: string;
    fixerId: string;
    otherUser: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
    repairRequest: {
      id: string;
      title: string;
    };
    activeJob?: { id: string; status: string } | null;
    offerStatuses?: Record<string, string>;
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
  const [newMessageCount, setNewMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);

  // Fetch messages on mount - check cache first
  useEffect(() => {
    const cached = conversationCache.get(conversationId);
    if (cached && Date.now() - cached.timestamp < 30000) {
      // Use cache if less than 30 seconds old
      setConversationData(cached.data);
      setMessages(cached.messages);
      prevMessageCountRef.current = cached.messages.length;
      setIsLoading(false);
      // Scroll to bottom on mount
      requestAnimationFrame(() => scrollToBottom("instant"));
      // Fetch fresh data in background
      fetchMessages(true);
    } else {
      fetchMessages(false, true);
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

  // Track scroll position to know if user is near the bottom
  useEffect(() => {
    const el = messageAreaRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 80;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      isNearBottomRef.current = atBottom;
      if (atBottom) {
        setNewMessageCount(0);
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Smart auto-scroll: only scroll when user is already at the bottom
  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const currentCount = messages.length;
    prevMessageCountRef.current = currentCount;

    if (currentCount <= prevCount) return; // no new messages (or initial load handled elsewhere)

    const incomingCount = currentCount - prevCount;

    if (isNearBottomRef.current) {
      scrollToBottom();
    } else if (prevCount > 0) {
      // User scrolled up — show indicator instead
      setNewMessageCount((n) => n + incomingCount);
    }
  }, [messages]);

  const fetchMessages = async (silent = false, scrollAfter = false) => {
    try {
      if (!silent) setIsLoading(true);

      const res = await fetch(`/api/messages/${conversationId}`);
      if (res.ok) {
        const data: ConversationData = await res.json();
        setConversationData(data);
        setMessages(data.messages);
        setHasMore(data.hasMore || false);

        // On initial load, seed the ref so the smart-scroll effect
        // doesn't treat every message as "new"
        if (scrollAfter) {
          prevMessageCountRef.current = data.messages.length;
        }

        // Update cache
        conversationCache.set(conversationId, {
          data,
          messages: data.messages,
          timestamp: Date.now(),
        });

        // Scroll to bottom on initial load
        if (scrollAfter) {
          requestAnimationFrame(() => scrollToBottom("instant"));
        }

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

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    isNearBottomRef.current = true;
    setNewMessageCount(0);
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
        const isVideo = selectedFile.type.startsWith("video/");

        if (isVideo) {
          // Use direct upload for videos (bypasses Vercel 4.5MB limit)
          const signedRes = await fetch("/api/upload/signed-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileType: selectedFile.type,
              fileSize: selectedFile.size,
              bucket: "repair-media",
            }),
          });
          if (!signedRes.ok) {
            alert("Failed to prepare video upload");
            setIsSending(false);
            setIsUploading(false);
            return;
          }
          const { signedUrl, publicUrl } = await signedRes.json();
          const directUpload = await fetch(signedUrl, {
            method: "PUT",
            headers: { "Content-Type": selectedFile.type, "x-upsert": "false" },
            body: selectedFile,
          });
          if (!directUpload.ok) {
            alert("Failed to upload video");
            setIsSending(false);
            setIsUploading(false);
            return;
          }
          photoUrl = publicUrl;
        } else {
          // Use API route for images (small enough for serverless)
          const formData = new FormData();
          formData.append("file", selectedFile);
          formData.append("bucket", "repair-media");

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

  // Handle actions from interactive chat cards (offer accept/reject/counter, etc.)
  const handleCardAction = async (action: string, data: Record<string, unknown>) => {
    try {
      let url = "";
      let body: Record<string, unknown> = {};

      switch (action) {
        case "accept-offer":
          url = `/api/offers/${data.offerId}/accept`;
          break;
        case "reject-offer":
          url = `/api/offers/${data.offerId}/reject`;
          break;
        case "counter-offer":
          url = `/api/offers/${data.offerId}/counter`;
          body = { counterPrice: data.counterPrice, counterMessage: data.counterMessage };
          break;
        case "accept-counter":
          url = `/api/offers/${data.offerId}/counter-accept`;
          break;
        case "reject-counter":
          url = `/api/offers/${data.offerId}/counter-reject`;
          break;
        case "start-job":
          url = `/api/jobs/${data.jobId}/start`;
          break;
        case "complete-job":
          url = `/api/jobs/${data.jobId}/complete`;
          break;
        case "cancel-job":
          url = `/api/jobs/${data.jobId}/cancel`;
          break;
        case "refresh":
          // Just refresh messages (used after inline review submit)
          fetchMessages(true);
          return;
        default:
          console.warn("Unknown card action:", action);
          return;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Action failed. Please try again.");
      }

      // Refresh messages to show updated state
      fetchMessages(true);
    } catch (error) {
      console.error("Error handling card action:", error);
      alert("Something went wrong. Please try again.");
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
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!conversationData) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <p className="text-sm text-gray-400">Conversation not found</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Header */}
      <div className="border-b border-gray-200/80 bg-white/95 backdrop-blur-sm px-4 md:px-6 py-3 flex items-center gap-3 z-10">
        <Link href="/messages" className="md:hidden p-1 -ml-1 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-secondary-600" />
        </Link>

        <Link href={`/profile/${conversationData.conversation.otherUser.id}`} className="shrink-0">
          {conversationData.conversation.otherUser.avatarUrl ? (
            <img
              src={conversationData.conversation.otherUser.avatarUrl}
              alt={conversationData.conversation.otherUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 hover:ring-primary-200 transition-all shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-gray-100 hover:ring-primary-200 transition-all shadow-sm">
              {conversationData.conversation.otherUser.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/${conversationData.conversation.otherUser.id}`}
            className="text-sm font-bold font-display text-secondary-800 truncate hover:text-primary transition-colors block"
          >
            {conversationData.conversation.otherUser.name}
          </Link>
          <Link
            href={`/request/${conversationData.conversation.repairRequest.id}`}
            className="text-xs text-primary-600/80 hover:text-primary hover:underline truncate block font-medium"
          >
            {conversationData.conversation.repairRequest.title}
          </Link>
        </div>

        {/* Job status badge in header */}
        {conversationData.conversation.activeJob && (
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            conversationData.conversation.activeJob.status === "COMPLETED"
              ? "bg-emerald-50 text-emerald-700"
              : conversationData.conversation.activeJob.status === "IN_PROGRESS"
              ? "bg-amber-50 text-amber-700"
              : conversationData.conversation.activeJob.status === "SCHEDULED"
              ? "bg-secondary-50 text-secondary-700"
              : "bg-gray-100 text-gray-600"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              conversationData.conversation.activeJob.status === "COMPLETED"
                ? "bg-emerald-500"
                : conversationData.conversation.activeJob.status === "IN_PROGRESS"
                ? "bg-amber-500 animate-pulse"
                : conversationData.conversation.activeJob.status === "SCHEDULED"
                ? "bg-secondary-500"
                : "bg-gray-400"
            }`} />
            {conversationData.conversation.activeJob.status.replace("_", " ")}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={messageAreaRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-4 pb-24 md:pb-4"
      >
        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              onClick={loadMoreMessages}
              disabled={isLoadingMore}
              className="px-5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isLoadingMore ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}

        {Object.entries(messageGroups).map(([dateLabel, msgs]) => (
          <div key={dateLabel}>
            {/* Date Divider */}
            <div className="flex items-center justify-center my-5">
              <div className="flex-1 h-px bg-gray-200/60" />
              <div className="px-4 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                {dateLabel}
              </div>
              <div className="flex-1 h-px bg-gray-200/60" />
            </div>

            {/* Messages */}
            {msgs.map((message) => {
              // Enrich system message metadata with live statuses
              const enrichedMessage = { ...message };
              if (message.type && message.metadata && conversationData) {
                const meta = { ...(message.metadata as Record<string, unknown>) };
                // Inject live offer status for offer/counter cards
                if (meta.offerId && conversationData.conversation.offerStatuses) {
                  meta.offerStatus = conversationData.conversation.offerStatuses[meta.offerId as string];
                }
                // Inject live job status for job cards
                if (conversationData.conversation.activeJob) {
                  meta.jobStatus = conversationData.conversation.activeJob.status;
                }
                enrichedMessage.metadata = meta;
              }

              return (
                <ChatBubble
                  key={message.id}
                  message={enrichedMessage}
                  isOwn={message.sender.id === session?.user?.id}
                  currentUserId={session?.user?.id}
                  isCustomer={session?.user?.id === conversationData?.conversation.customerId}
                  isFixer={session?.user?.id === conversationData?.conversation.fixerId}
                  onRetry={
                    message.failed
                      ? () => handleRetryMessage(message.id, message.content)
                      : undefined
                  }
                  onAction={handleCardAction}
                />
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* New messages indicator */}
      {newMessageCount > 0 && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-28 md:bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-2 bg-secondary-800 text-white text-xs font-semibold rounded-full shadow-elevated hover:bg-secondary-700 transition-all"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          {newMessageCount === 1
            ? "1 new message"
            : `${newMessageCount} new messages`}
        </button>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200/80 bg-white/95 backdrop-blur-sm p-3 md:p-4 fixed bottom-16 md:bottom-0 left-0 right-0 md:relative">
        {/* File Preview */}
        {filePreview && (
          <div className="mb-3 relative inline-block">
            <div className="relative">
              {selectedFile?.type.startsWith("image/") ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-w-xs max-h-32 rounded-xl border border-gray-200 shadow-card"
                />
              ) : (
                <video
                  src={filePreview}
                  className="max-w-xs max-h-32 rounded-xl border border-gray-200 shadow-card"
                  controls
                />
              )}
              <button
                type="button"
                onClick={handleCancelFile}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <div className="text-white text-xs font-medium">Uploading...</div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2.5 text-gray-400 hover:text-primary rounded-xl hover:bg-primary-50 transition-all"
            disabled={isSending || isUploading}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white focus:border-primary-200 transition-all text-sm max-h-32 placeholder:text-gray-400"
            style={{
              minHeight: "2.5rem",
              maxHeight: "8rem",
            }}
            disabled={isUploading}
          />

          <button
            type="submit"
            disabled={(!newMessage.trim() && !selectedFile) || isSending || isUploading}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-600 transition-all shadow-sm hover:shadow-glow-orange"
          >
            {isSending || isUploading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
