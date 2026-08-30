"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type ChatMessageDto = {
  id: string;
  userId: string;
  senderId: string;
  senderRole: "USER" | "ADMIN";
  senderName: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
};

export type ChatThreadDto = {
  userId: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    accountNumber: string | null;
    totalBalance: number;
    verificationStatus: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderRole: "USER" | "ADMIN";
  };
  unreadCount: number;
  totalCount: number;
};

// Send message action
export async function sendChatMessage(input: {
  content: string;
  targetUserId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const text = input.content.trim();
  if (!text) {
    throw new Error("Message content cannot be empty");
  }

  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    if (!input.targetUserId) {
      throw new Error("Target user ID is required for admin replies");
    }

    const message = await prisma.chatMessage.create({
      data: {
        userId: input.targetUserId,
        senderId: session.user.id,
        senderRole: "ADMIN",
        senderName: "CoinVault Support",
        content: text,
        isRead: false,
      },
    });

    revalidatePath("/admin");
    return {
      success: true,
      message: {
        ...message,
        createdAt: message.createdAt.toISOString(),
      },
    };
  } else {
    // Normal User sending to support
    const message = await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        senderId: session.user.id,
        senderRole: "USER",
        senderName: session.user.name || "Customer",
        content: text,
        isRead: false,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      message: {
        ...message,
        createdAt: message.createdAt.toISOString(),
      },
    };
  }
}

// Fetch messages for a thread and mark relevant unread messages as read
export async function getChatMessages(targetUserId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const isAdmin = session.user.role === "ADMIN";
  const conversationUserId = isAdmin ? targetUserId : session.user.id;

  if (!conversationUserId) {
    return [];
  }

  // Fetch messages
  const messages = await prisma.chatMessage.findMany({
    where: { userId: conversationUserId },
    orderBy: { createdAt: "asc" },
  });

  // Mark incoming unread messages as read
  if (isAdmin) {
    // Admin marks user messages as read
    await prisma.chatMessage.updateMany({
      where: {
        userId: conversationUserId,
        senderRole: "USER",
        isRead: false,
      },
      data: { isRead: true },
    });
  } else {
    // User marks admin messages as read
    await prisma.chatMessage.updateMany({
      where: {
        userId: conversationUserId,
        senderRole: "ADMIN",
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  return messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));
}

// Fetch all conversation threads for the Admin Support Center
export async function getAdminChatThreads(): Promise<ChatThreadDto[]> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  // Get distinct users who have messages or all registered users
  const usersWithMessages = await prisma.user.findMany({
    where: {
      chatMessages: {
        some: {},
      },
    },
    include: {
      chatMessages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const threads: ChatThreadDto[] = await Promise.all(
    usersWithMessages.map(async (u) => {
      const unreadCount = await prisma.chatMessage.count({
        where: {
          userId: u.id,
          senderRole: "USER",
          isRead: false,
        },
      });

      const totalCount = await prisma.chatMessage.count({
        where: { userId: u.id },
      });

      const lastMsg = u.chatMessages[0];

      return {
        userId: u.id,
        user: {
          id: u.id,
          email: u.email,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          accountNumber: u.accountNumber,
          totalBalance: u.totalBalance,
          verificationStatus: u.verificationStatus,
        },
        lastMessage: {
          content: lastMsg?.content || "No messages yet",
          createdAt: lastMsg?.createdAt ? lastMsg.createdAt.toISOString() : new Date().toISOString(),
          senderRole: (lastMsg?.senderRole as "USER" | "ADMIN") || "USER",
        },
        unreadCount,
        totalCount,
      };
    })
  );

  // Sort threads: threads with unread messages first, then by last message timestamp desc
  return threads.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
  });
}

// Get unread count for badge
export async function getUnreadChatCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  if (session.user.role === "ADMIN") {
    return await prisma.chatMessage.count({
      where: {
        senderRole: "USER",
        isRead: false,
      },
    });
  } else {
    return await prisma.chatMessage.count({
      where: {
        userId: session.user.id,
        senderRole: "ADMIN",
        isRead: false,
      },
    });
  }
}
