import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreateConversation } from "@/lib/support";

// POST - Start a new conversation or return the existing open one
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { visitorSessionId } = body;

    let userId: string | null = null;
    let userName = "Visitor";
    let userType: "VISITOR" | "CUSTOMER" | "FIXER" = "VISITOR";
    let userCity: string | null = null;

    if (session?.user) {
      userId = session.user.id;
      userName = session.user.name || "User";
      userType = session.user.userType === "FIXER" ? "FIXER" : "CUSTOMER";

      // Fetch city from database since it's not on the session type
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { city: true },
      });
      userCity = dbUser?.city || null;
    } else if (!visitorSessionId) {
      return NextResponse.json(
        { error: "visitorSessionId is required for unauthenticated users" },
        { status: 400 }
      );
    }

    const conversation = await getOrCreateConversation(
      userId,
      visitorSessionId || null,
      userName,
      userType,
      userCity
    );

    return NextResponse.json(conversation, { status: 200 });
  } catch (error) {
    console.error("Error creating support conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
