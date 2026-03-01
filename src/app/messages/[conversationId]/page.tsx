import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ChatWindow from "@/components/chat/ChatWindow";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const session = await auth();
  const { conversationId } = await params;

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/messages");
  }

  // Verify user is part of this conversation
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    redirect("/messages");
  }

  if (
    conversation.customerId !== session.user.id &&
    conversation.fixerId !== session.user.id
  ) {
    redirect("/messages");
  }

  return (
    <div className="h-full">
      <ChatWindow conversationId={conversationId} />
    </div>
  );
}
