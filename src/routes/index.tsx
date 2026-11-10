import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Clock3, History, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { AiStatusBadge } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { TOOL_NAV } from "@/lib/nav";
import {
  historyStore,
  prefsStore,
  removeHistory,
  useLocalStore,
  type HistoryEntry,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Your AI productivity hub: summarise meetings, research topics and chat with a workplace assistant.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Save hours every week with AI meeting summaries, research briefings and a workplace chatbot.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const FEATURES = [
  {
    nav: TOOL_NAV.meeting,
    blurb: "Paste notes or transcripts. Get decisions, action items, owners and deadlines.",
    cta: "Summarize a meeting",
    points: ["Action item table", "Responsibilities", "Follow-up email"],
  },
  {
    nav: TOOL_NAV.research,
    blurb: "Explore a topic or analyse an article. Get insights and practical recommendations.",
    cta: "Start researching",
    points: ["Executive summary", "Key insights", "30-60-90 plans"],
  },
  {
    nav: TOOL_NAV.chat,
    blurb: "Ask workplace questions, draft professional content and work through problems.",
    cta: "Open AI chat",
    points: ["Emails & documents", "Prioritisation", "Problem solving"],
  },
];

function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);
  return greeting;
}

function Dashboard() {
  const prefs = useLocalStore(prefsStore);
  const history = useLocalStore(historyStore);
  const greeting = useGreeting();

  const counts = {
    meeting: history.filter((h) => h.tool === "meeting").length,
    research: history.filter((h) => h.tool === "research").length,
    chat: history.filter((h) => h.tool === "chat").length,
  };
  // Rough estimate: ~20 min saved per summary/brief, ~5 min per chat.
  const minutesSaved = counts.meeting * 20 + counts.research * 20 + counts.chat * 5;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:py-8">
      {/* Welcome */}
      <section className="animate-fade-up bg-hero relative overflow-hidden rounded-3xl p-6 text-ink-foreground shadow-lift sm:p-10">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-spectrum" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4">
              <AiStatusBadge />
            </div>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {greeting}
              {prefs.name ? `, ${prefs.name}` : ""}.
              <br />
              <span className="text-spectrum">Let's get more done today.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-ink-foreground/75 sm:text-base">
              Your AI workplace assistant turns meetings into action, research into decisions and
              questions into ready-to-use answers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/meetings">
                  Summarize a meeting <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <Link to="/chat">Ask the assistant</Link>
              </Button>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3 lg:w-96">
            {[
              { label: "Summaries", value: counts.meeting },
              { label: "Briefs", value: counts.research },
              { label: "Est. time saved", value: minutesSaved >= 60 ? `${(minutesSaved / 60).toFixed(1)}h` : `${minutesSaved}m` },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-ink-foreground/10 bg-ink-foreground/5 p-4 backdrop-blur"
              >
                <dt className="text-[0.7rem] font-medium text-ink-foreground/65">{s.label}</dt>
                <dd className="mt-1 font-display text-2xl font-bold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Feature cards */}
      <section>
        <h2 className="mb-4 text-lg font-bold">Your AI tools</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Link
              key={f.nav.url}
              to={f.nav.url}
              className="animate-fade-up group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              style={{ animationDelay: `${80 + i * 70}ms` }}
            >
              <div className={cn("absolute inset-x-0 top-0 h-1", f.nav.gradient)} />
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl text-ink transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
                  f.nav.gradient,
                )}
              >
                <f.nav.icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{f.nav.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.blurb}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {f.points.map((p) => (
                  <li key={p} className="rounded-full bg-muted px-2.5 py-1 text-[0.7rem] font-medium text-muted-foreground">
                    {p}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                {f.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="animate-fade-up rounded-2xl border bg-card shadow-card [animation-delay:200ms]">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            <h2 className="text-base font-bold">Recent activity</h2>
          </div>
          <span className="text-xs text-muted-foreground">Stored in this browser only</span>
        </div>
        {history.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Clock3 className="size-8 text-muted-foreground/60" />
            <p className="font-semibold">No activity yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Your meeting summaries, research briefs and chats will show up here so you can pick up
              where you left off.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {history.slice(0, 8).map((entry) => (
              <ActivityRow key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </section>

      <AiDisclaimer />
    </div>
  );
}

function ActivityRow({ entry }: { entry: HistoryEntry }) {
  const nav = TOOL_NAV[entry.tool];
  const preview = entry.output.replace(/[#>*_|`-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);

  return (
    <li className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/40">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl text-ink", nav.gradient)}>
        <nav.icon className="size-5" />
      </span>
      {entry.tool === "chat" ? (
        <Link to="/chat" className="min-w-0 flex-1">
          <RowText entry={entry} label={nav.short} preview={preview} />
        </Link>
      ) : (
        <Link
          to={entry.tool === "meeting" ? "/meetings" : "/research"}
          search={{ entry: entry.id }}
          className="min-w-0 flex-1"
        >
          <RowText entry={entry} label={nav.short} preview={preview} />
        </Link>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Remove from history"
        className="opacity-60 group-hover:opacity-100"
        onClick={() => removeHistory(entry.id)}
      >
        <Trash2 />
      </Button>
    </li>
  );
}

function RowText({ entry, label, preview }: { entry: HistoryEntry; label: string; preview: string }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <p className="truncate text-sm font-semibold">{entry.title}</p>
        {entry.demo && (
          <span className="shrink-0 rounded-full bg-warning px-1.5 py-0.5 text-[0.6rem] font-semibold text-warning-foreground">
            Demo
          </span>
        )}
      </div>
      <p className="truncate text-xs text-muted-foreground">
        {label} · {formatDistanceToNow(entry.updatedAt, { addSuffix: true })}
        {preview ? ` · ${preview}` : ""}
      </p>
    </>
  );
}
