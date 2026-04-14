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
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-background">
      {/* Conversations sidebar */}
      <div className="hidden md:flex md:w-[340px] lg:w-[380px] flex-col border-r border-gray-200/80 bg-white h-full overflow-hidden">
        <ConversationList />
      </div>

      {/* Chat area */}
      <div className="flex-1 h-full overflow-hidden">{children}</div>
    </div>
  );
}
