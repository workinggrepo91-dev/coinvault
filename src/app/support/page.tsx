import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import SupportPageClient from "@/components/SupportPageClient";
import { getChatMessages } from "@/app/actions/chat";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch initial chat messages for the current user (DO NOT mark read on server/prefetch)
  let initialMessages: any[] = [];
  try {
    const rawMessages = await getChatMessages(session.user.id, false);
    initialMessages = (rawMessages || []).map((m: any) => ({
      ...m,
      createdAt:
        typeof m.createdAt === "string"
          ? m.createdAt
          : m.createdAt.toISOString(),
    }));
  } catch (e) {
    console.error("Error fetching support chat messages on server:", e);
  }

  return (
    <AppShell role={session.user.role}>
      <SupportPageClient
        initialMessages={initialMessages}
        userName={session.user.name || undefined}
      />
    </AppShell>
  );
}

