import { createFileRoute } from "@tanstack/react-router";

import { ToolWorkspace } from "@/components/tool-workspace";

export const Route = createFileRoute("/research")({
  validateSearch: (search: Record<string, unknown>): { entry?: string } =>
    typeof search["entry"] === "string" ? { entry: search["entry"] } : {},
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI" },
      {
        name: "description",
        content:
          "Research a topic or analyse an article to get summaries, key insights, recommendations and practical takeaways.",
      },
      { property: "og:title", content: "AI Research Assistant — Workplace AI" },
      {
        property: "og:description",
        content: "Get research briefings with insights, recommendations and practical takeaways.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const { entry } = Route.useSearch();
  return <ToolWorkspace tool="research" entryId={entry} />;
}
