import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  sendChatMessage,
  getChatMessages,
  getAdminChatThreads,
  getUnreadChatCount,
} from "@/app/actions/chat";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const threads = searchParams.get("threads");
    const unreadOnly = searchParams.get("unreadOnly");
    const userId = searchParams.get("userId") || undefined;

    if (unreadOnly === "true") {
      const count = await getUnreadChatCount();
      return NextResponse.json({ unreadCount: count });
    }

    if (threads === "true") {
      if (session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const threadList = await getAdminChatThreads();
      return NextResponse.json({ threads: threadList });
    }

    const messages = await getChatMessages(userId);
    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("GET /api/chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch chat data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, targetUserId } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const result = await sendChatMessage({
      content,
      targetUserId,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send chat message" },
      { status: 500 }
    );
  }
}
