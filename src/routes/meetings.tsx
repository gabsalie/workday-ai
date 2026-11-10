import { createFileRoute } from "@tanstack/react-router";

import { ToolWorkspace } from "@/components/tool-workspace";

export const Route = createFileRoute("/meetings")({
  validateSearch: (search: Record<string, unknown>): { entry?: string } =>
    typeof search["entry"] === "string" ? { entry: search["entry"] } : {},
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — Workplace AI" },
      {
        name: "description",
        content:
          "Paste meeting notes and get structured summaries with decisions, action items, owners and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — Workplace AI" },
      {
        property: "og:description",
        content: "Turn messy meeting notes into decisions, owners and deadlines in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const { entry } = Route.useSearch();
  return <ToolWorkspace tool="meeting" entryId={entry} />;
}
