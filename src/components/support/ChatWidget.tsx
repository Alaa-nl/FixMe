"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, X, Send, User } from "lucide-react";
import SupportMessage from "./SupportMessage";

interface Message {
  id: string;
  content: string;
  senderType: "USER" | "AI" | "ADMIN";
  createdAt: Date | string;
  sending?: boolean;
  failed?: boolean;
}

interface ConversationState {
  id: string;
  status: "OPEN" | "ESCALATED" | "RESOLVED";
}

// Generate or retrieve visitor session ID from localStorage
function getVisitorSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("fixme_support_session");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("fixme_support_session", sessionId);
  }
  return sessionId;
}

export default function ChatWidget() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationState | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    isNearBottomRef.current = true;
  }, []);

  // Track scroll position
  useEffect(() => {
    const el = messageAreaRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 80;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      isNearBottomRef.current = atBottom;
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const currentCount = messages.length;
    prevMessageCountRef.current = currentCount;

    if (currentCount <= prevCount) return;

    if (isNearBottomRef.current) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Poll for new messages when escalated (2s active, 10s hidden)
  useEffect(() => {
    if (!conversation || conversation.status !== "ESCALATED") return;

    const getPollingInterval = () => (document.hidden ? 10000 : 2000);

    let interval = setInterval(() => {
      pollMessages();
    }, getPollingInterval());

    const handleVisibilityChange = () => {
      clearInterval(interval);
      interval = setInterval(() => {
        pollMessages();
      }, getPollingInterval());

      // Fetch immediately when tab becomes visible
      if (!document.hidden) {
        pollMessages();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [conversation?.id, conversation?.status]);

  // Poll messages from server
  const pollMessages = async () => {
    if (!conversation) return;

    try {
      const visitorSessionId = session?.user ? "" : getVisitorSessionId();
      const queryParam = visitorSessionId
        ? `?visitorSessionId=${visitorSessionId}`
        : "";

      const res = await fetch(
        `/api/support/${conversation.id}/messages${queryParam}`
      );

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);

        // Update conversation status if changed
        if (data.conversation.status !== conversation.status) {
          setConversation((prev) =>
            prev ? { ...prev, status: data.conversation.status } : prev
          );
        }
      }
    } catch (error) {
      console.error("Error polling support messages:", error);
    }
  };

  // Initialize or resume a conversation
  const startConversation = async () => {
    setIsLoading(true);
    try {
      const visitorSessionId = session?.user ? undefined : getVisitorSessionId();

      const res = await fetch("/api/support/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorSessionId }),
      });

      if (res.ok) {
        const conv = await res.json();
        setConversation({ id: conv.id, status: conv.status });
        setHasStarted(true);

        // Load existing messages if conversation already existed
        const messagesRes = await fetch(
          `/api/support/${conv.id}/messages${
            visitorSessionId ? `?visitorSessionId=${visitorSessionId}` : ""
          }`
        );

        if (messagesRes.ok) {
          const data = await messagesRes.json();
          setMessages(data.messages);
          prevMessageCountRef.current = data.messages.length;
          requestAnimationFrame(() => scrollToBottom("instant"));
        }
      }
    } catch (error) {
      console.error("Error starting support conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening the widget
  const handleOpen = () => {
    setIsOpen(true);
    if (!hasStarted) {
      startConversation();
    }
    // Focus input after render
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  // Send a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const content = newMessage.trim();
    if (!content || isSending || !conversation) return;

    setNewMessage("");
    setIsSending(true);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content,
      senderType: "USER",
      createdAt: new Date().toISOString(),
      sending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    // Show typing indicator only for AI (not when escalated)
    if (conversation.status !== "ESCALATED") {
      setIsTyping(true);
    }

    try {
      const res = await fetch("/api/support/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversation.id, content }),
      });

      if (res.ok) {
        const data = await res.json();

        setMessages((prev) => {
          // Replace optimistic message with real user message
          let updated = prev.map((msg) =>
            msg.id === tempId ? data.userMessage : msg
          );

          // Add AI message if present (not returned when escalated)
          if (data.aiMessage) {
            updated = [...updated, data.aiMessage];
          }

          return updated;
        });
      } else {
        // Mark as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, sending: false, failed: true } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending support message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, sending: false, failed: true } : msg
        )
      );
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  // Retry a failed message
  const handleRetryMessage = async (messageId: string, content: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    setNewMessage(content);
  };

  // Escalate to human
  const handleEscalate = async () => {
    if (!conversation) return;

    try {
      const res = await fetch("/api/support/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversation.id }),
      });

      if (res.ok) {
        const updated = await res.json();
        setConversation((prev) =>
          prev ? { ...prev, status: updated.status } : prev
        );

        // Refresh messages to get the escalation system message
        await pollMessages();
      }
    } catch (error) {
      console.error("Error escalating conversation:", error);
    }
  };

  // Handle Enter key (send on Enter, newline on Shift+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const userName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-[9999] w-14 h-14 rounded-full bg-[#FF6B35] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
          aria-label="Open support chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed inset-0 md:inset-auto md:bottom-8 md:right-8 md:w-[380px] md:h-[520px] z-[9999] flex flex-col bg-white md:rounded-2xl md:shadow-2xl overflow-hidden"
          style={{
            animation: "slideUp 0.25s ease-out",
          }}
        >
          {/* Header */}
          <div className="bg-[#1B4965] px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#FF6B35] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm">FixMe Support</h3>
              <p className="text-white/60 text-xs">
                {conversation?.status === "ESCALATED"
                  ? "Connected to support team"
                  : "AI-powered help"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages area */}
          <div
            ref={messageAreaRef}
            className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full" />
              </div>
            ) : messages.length === 0 ? (
              /* Welcome screen */
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-14 h-14 rounded-full bg-[#FF6B35]/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-7 h-7 text-[#FF6B35]" />
                </div>
                <h4 className="text-gray-800 font-semibold mb-1 text-sm">
                  Hi {userName}!
                </h4>
                <p className="text-gray-500 text-xs leading-relaxed">
                  I&apos;m the FixMe assistant. Ask me anything about repairs,
                  payments, disputes, or how the platform works.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <SupportMessage
                    key={msg.id}
                    message={msg}
                    sending={msg.sending}
                    failed={msg.failed}
                    onRetry={
                      msg.failed
                        ? () => handleRetryMessage(msg.id, msg.content)
                        : undefined
                    }
                  />
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                      <div className="flex gap-0.5">
                        <span
                          className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">AI is typing...</span>
                  </div>
                )}

                {/* Waiting for admin indicator */}
                {conversation?.status === "ESCALATED" &&
                  messages.length > 0 &&
                  messages[messages.length - 1]?.senderType !== "ADMIN" && (
                    <div className="flex items-center justify-center py-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                        <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full" />
                        Waiting for support team...
                      </div>
                    </div>
                  )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Talk to human button */}
          {conversation &&
            conversation.status === "OPEN" &&
            messages.length > 0 && (
              <div className="px-4 py-1.5 bg-white border-t border-gray-100">
                <button
                  onClick={handleEscalate}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 text-gray-500 hover:text-gray-700 text-xs transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Talk to a human
                </button>
              </div>
            )}

          {/* Resolved banner */}
          {conversation?.status === "RESOLVED" && (
            <div className="px-4 py-2 bg-green-50 border-t border-green-200 text-center">
              <p className="text-green-700 text-xs font-medium">
                This conversation has been resolved.
              </p>
              <button
                onClick={() => {
                  setConversation(null);
                  setMessages([]);
                  setHasStarted(false);
                  startConversation();
                }}
                className="text-green-600 text-xs underline hover:text-green-800 mt-0.5"
              >
                Start a new chat
              </button>
            </div>
          )}

          {/* Input area */}
          {conversation?.status !== "RESOLVED" && (
            <div className="px-3 py-2.5 bg-white border-t border-gray-200 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    conversation?.status === "ESCALATED"
                      ? "Message support team..."
                      : "Ask a question..."
                  }
                  rows={1}
                  className="flex-1 px-3.5 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm max-h-24"
                  style={{ minHeight: "2.25rem" }}
                  disabled={isSending || isLoading}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending || isLoading}
                  className="flex-shrink-0 w-9 h-9 rounded-full bg-[#FF6B35] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
                >
                  {isSending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
