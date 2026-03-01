import ConversationList from "@/components/chat/ConversationList";
import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
  return (
    <>
      {/* Mobile: Show conversation list */}
      <div className="md:hidden h-full">
        <div className="bg-white border-b px-4 py-3">
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        </div>
        <ConversationList />
      </div>

      {/* Desktop: Show placeholder */}
      <div className="hidden md:flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Select a conversation
          </h2>
          <p className="text-gray-500">
            Choose a conversation from the list to start chatting
          </p>
        </div>
      </div>
    </>
  );
}
