import ConversationList from "@/components/chat/ConversationList";
import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
  return (
    <>
      {/* Mobile: Show conversation list */}
      <div className="md:hidden h-full">
        <div className="bg-white border-b border-gray-200/80 px-5 py-4">
          <h1 className="text-2xl font-bold font-display text-secondary-800">
            Messages
          </h1>
        </div>
        <ConversationList />
      </div>

      {/* Desktop: Elegant empty state */}
      <div className="hidden md:flex items-center justify-center h-full bg-gradient-to-br from-background via-white to-primary-50/30 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary-100/20 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-secondary-100/20 blur-3xl" />

        <div className="text-center relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mx-auto mb-6 shadow-card">
            <MessageCircle className="w-9 h-9 text-primary-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-display font-bold text-secondary-800 mb-2">
            Select a conversation
          </h2>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            Choose a conversation from the sidebar to view your repair discussions and transactions
          </p>
        </div>
      </div>
    </>
  );
}
