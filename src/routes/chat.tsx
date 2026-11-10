import { useSuspenseQuery } from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";

import { ChatView } from "@/components/chat/chat-view";
import { aiStatusQuery } from "@/lib/ai-status.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Workplace Chat — Workplace AI" },
      {
        name: "description",
        content:
          "Chat with an AI workplace assistant to draft emails, plan work, solve problems and get practical answers.",
      },
      { property: "og:title", content: "AI Workplace Chat — Workplace AI" },
      {
        property: "og:description",
        content: "Draft professional content and solve workplace problems with an AI assistant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { data } = useSuspenseQuery(aiStatusQuery);
  return (
    <ClientOnly
      fallback={
        <div className="mx-auto flex h-[calc(100svh-3.5rem)] max-w-4xl flex-col gap-3 p-6">
          <div className="flex-1 animate-pulse rounded-2xl bg-muted" />
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        </div>
      }
    >
      <ChatView live={data.live} />
    </ClientOnly>
  );
}
