import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ConversationList from "@/components/chat/ConversationList";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/messages");
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
      {/* Conversations List - Hidden on mobile when viewing a conversation */}
      <div className="hidden md:block md:w-1/3 lg:w-1/4 border-r h-full overflow-hidden">
        <ConversationList />
      </div>

      {/* Chat Window / Placeholder */}
      <div className="flex-1 h-full overflow-hidden">{children}</div>
    </div>
  );
}
