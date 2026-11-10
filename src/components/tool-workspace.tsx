import { useCompletion } from "@ai-sdk/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Check,
  Copy,
  Eye,
  Lightbulb,
  PencilLine,
  RefreshCw,
  Send,
  Square,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { AiDisclaimer } from "@/components/ai-disclaimer";
import { MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { aiStatusQuery } from "@/lib/ai-status.functions";
import { demoMeetingSummary, demoResearch, simulateStream } from "@/lib/demo";
import { TOOL_NAV } from "@/lib/nav";
import { readableError } from "@/lib/errors";
import {
  historyStore,
  makeTitle,
  newId,
  prefsStore,
  upsertHistory,
  useLocalStore,
} from "@/lib/storage";
import {
  MAX_INPUT_CHARS,
  MEETING_REFINEMENTS,
  MEETING_SAMPLES,
  RESEARCH_REFINEMENTS,
  RESEARCH_SAMPLES,
  type ToolId,
} from "@/lib/tools";
import { cn } from "@/lib/utils";

type RunRequest = { prompt: string; previous?: string; refinement?: string };

const COPY = {
  meeting: {
    eyebrow: "Meeting Notes Summarizer",
    heading: "Turn messy notes into clear next steps",
    sub: "Paste notes or a transcript. Get a structured summary with decisions, owners and deadlines.",
    inputLabel: "Meeting notes or transcript",
    placeholder:
      "Paste your meeting notes here…\n\ne.g. Attendees: Priya, Marcus. Marcus to finish the API by Friday. Decided to launch on 28 Nov…",
    generate: "Summarize meeting",
    loading: "Analysing discussion, decisions and owners…",
    emptyTitle: "Your structured summary will appear here",
    emptyItems: ["Key discussion points", "Decisions made", "Action items with owners & deadlines", "Open questions & risks"],
  },
  research: {
    eyebrow: "AI Research Assistant",
    heading: "Research faster, decide smarter",
    sub: "Enter a topic or paste an article. Get a briefing with insights, recommendations and takeaways.",
    inputLabel: "Topic, question or article",
    placeholder:
      "Ask a research question or paste an article…\n\ne.g. What are the best practices for running effective remote retrospectives?",
    generate: "Generate research brief",
    loading: "Researching and structuring insights…",
    emptyTitle: "Your research brief will appear here",
    emptyItems: ["Executive summary", "Key insights", "Recommendations", "Practical takeaways"],
  },
} as const;

export function ToolWorkspace({ tool, entryId }: { tool: ToolId; entryId?: string | undefined }) {
  const nav = TOOL_NAV[tool];
  const copy = COPY[tool];
  const { data: status } = useSuspenseQuery(aiStatusQuery);
  const prefs = useLocalStore(prefsStore);

  const [input, setInput] = useState("");
  const [view, setView] = useState<"preview" | "edit">("preview");
  const [refineText, setRefineText] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [isDemoOutput, setIsDemoOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const currentId = useRef<string | null>(null);
  const lastRequest = useRef<RunRequest | null>(null);
  const demoSignal = useRef({ cancelled: false });

  const {
    completion,
    setCompletion,
    complete,
    isLoading,
    stop,
    error,
  } = useCompletion({
    api: "/api/generate",
    id: `tool-${tool}`,
    onError: (err) => toast.error(readableError(err)),
  });

  const loading = isLoading || demoLoading;
  const options =
    tool === "meeting"
      ? prefs.meeting
      : { ...prefs.research, audience: prefs.research.audience.trim() || "Business leaders and managers" };

  // Open an item from recent activity
  useEffect(() => {
    if (!entryId) return;
    const entry = historyStore.get().find((e) => e.id === entryId);
    if (entry && entry.tool === tool) {
      setInput(entry.input);
      setCompletion(entry.output);
      setIsDemoOutput(entry.demo);
      currentId.current = entry.id;
      lastRequest.current = { prompt: entry.input };
    }
  }, [entryId, tool, setCompletion]);

  const save = useCallback(
    (output: string, demo: boolean) => {
      if (!output.trim() || !lastRequest.current) return;
      const id = currentId.current ?? newId();
      currentId.current = id;
      upsertHistory({
        id,
        tool,
        title: makeTitle(lastRequest.current.prompt),
        input: lastRequest.current.prompt,
        output,
        demo,
        updatedAt: Date.now(),
      });
    },
    [tool],
  );

  const run = async (req: RunRequest) => {
    if (loading) return;
    lastRequest.current = req;
    setView("preview");

    if (!status.live) {
      demoSignal.current = { cancelled: false };
      setDemoLoading(true);
      setCompletion("");
      const text =
        tool === "meeting"
          ? demoMeetingSummary(req.prompt, prefs.meeting)
          : demoResearch(req.prompt, prefs.research);
      const out = await simulateStream(text, setCompletion, demoSignal.current);
      setDemoLoading(false);
      setIsDemoOutput(true);
      save(out, true);
      return;
    }

    const result = await complete(req.prompt, {
      body: { tool, options, previous: req.previous, refinement: req.refinement },
    });
    setIsDemoOutput(false);
    if (result) save(result, false);
  };

  const handleGenerate = () => {
    const prompt = input.trim();
    if (!prompt) {
      toast.message("Add some content first", { description: "Paste notes or try a sample below." });
      return;
    }
    currentId.current = null;
    void run({ prompt });
  };

  const handleRefine = (instruction: string) => {
    const refinement = instruction.trim();
    if (!refinement || !completion.trim()) return;
    const base = lastRequest.current?.prompt ?? input.trim();
    setRefineText("");
    void run({ prompt: base, previous: completion, refinement });
  };

  const handleStop = () => {
    demoSignal.current.cancelled = true;
    setDemoLoading(false);
    stop();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(completion);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const clearOutput = () => {
    handleStop();
    setCompletion("");
    currentId.current = null;
    lastRequest.current = null;
    setView("preview");
  };

  const samples = tool === "meeting" ? MEETING_SAMPLES : RESEARCH_SAMPLES;
  const refinements = tool === "meeting" ? MEETING_REFINEMENTS : RESEARCH_REFINEMENTS;
  const hasOutput = completion.trim().length > 0;
  const errorMessage = error ? readableError(error) : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      {/* Heading */}
      <div className="animate-fade-up mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl text-ink shadow-card",
              nav.gradient,
            )}
          >
            <nav.icon className="size-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {copy.eyebrow}
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{copy.heading}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{copy.sub}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Input card */}
        <section className="animate-fade-up flex flex-col rounded-2xl border bg-card shadow-card">
          <div className="flex items-center justify-between gap-2 border-b px-5 py-3.5">
            <Label htmlFor={`${tool}-input`} className="text-sm font-semibold">
              {copy.inputLabel}
            </Label>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setInput("")}
              disabled={!input || loading}
            >
              <X /> Clear
            </Button>
          </div>

          <div className="flex flex-1 flex-col gap-4 p-5">
            <div className="relative">
              <Textarea
                id={`${tool}-input`}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_CHARS))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder={copy.placeholder}
                className="min-h-56 resize-y rounded-xl border-input bg-background/60 p-4 text-sm leading-relaxed lg:min-h-72"
              />
              <span className="pointer-events-none absolute right-3 bottom-2 text-[0.68rem] text-muted-foreground">
                {input.trim() ? input.trim().split(/\s+/).length : 0} words
              </span>
            </div>

            {tool === "meeting" ? <MeetingOptionsPanel /> : <ResearchOptionsPanel />}

            <div className="flex flex-wrap items-center gap-2">
              {loading ? (
                <Button size="lg" variant="outline" onClick={handleStop} className="flex-1 sm:flex-none">
                  <Square className="fill-current" /> Stop generating
                </Button>
              ) : (
                <Button size="lg" variant="brand" onClick={handleGenerate} className="flex-1 sm:flex-none">
                  <Wand2 /> {copy.generate}
                </Button>
              )}
              <span className="hidden text-xs text-muted-foreground sm:inline">
                or press <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans">Ctrl</kbd> +{" "}
                <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans">Enter</kbd>
              </span>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Lightbulb className="size-3.5 text-brand-yellow" /> Try a sample
              </p>
              <div className="flex flex-wrap gap-2">
                {samples.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setInput(s.text);
                      if (tool === "research")
                        prefsStore.set((p) => ({ ...p, research: { ...p.research, mode: "topic" } }));
                    }}
                    className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:-translate-y-px hover:border-primary/40 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Output card */}
        <section className="animate-fade-up relative flex min-h-[28rem] flex-col overflow-hidden rounded-2xl border bg-card shadow-card [animation-delay:80ms]">
          {loading && <div className="loading-bar absolute inset-x-0 top-0 h-1" />}
          <div className="spectrum-wash flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <ViewTab active={view === "preview"} onClick={() => setView("preview")} disabled={!hasOutput}>
                <Eye className="size-3.5" /> Preview
              </ViewTab>
              <ViewTab
                active={view === "edit"}
                onClick={() => setView("edit")}
                disabled={!hasOutput || loading}
              >
                <PencilLine className="size-3.5" /> Edit
              </ViewTab>
            </div>
            <div className="flex items-center gap-1">
              {isDemoOutput && hasOutput && (
                <span className="mr-1 rounded-full bg-warning px-2 py-0.5 text-[0.68rem] font-semibold text-warning-foreground">
                  Demo output
                </span>
              )}
              <IconAction label="Copy" onClick={handleCopy} disabled={!hasOutput || loading}>
                {copied ? <Check className="text-success" /> : <Copy />}
              </IconAction>
              <IconAction
                label="Regenerate"
                onClick={() => lastRequest.current && void run(lastRequest.current)}
                disabled={!lastRequest.current || loading}
              >
                <RefreshCw />
              </IconAction>
              <IconAction label="Clear output" onClick={clearOutput} disabled={!hasOutput && !loading}>
                <Trash2 />
              </IconAction>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {errorMessage && !loading && (
              <div className="m-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <p className="font-semibold">Couldn't generate a response</p>
                <p className="mt-1 text-destructive/90">{errorMessage}</p>
              </div>
            )}

            {!hasOutput && loading && (
              <div className="space-y-4 p-6">
                <Shimmer className="text-sm font-medium">{copy.loading}</Shimmer>
                {[80, 95, 70, 88, 60].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 animate-pulse rounded-full bg-muted"
                    style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            )}

            {!hasOutput && !loading && !errorMessage && (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <span
                  className={cn(
                    "flex size-14 items-center justify-center rounded-2xl text-ink opacity-90",
                    nav.gradient,
                  )}
                >
                  <nav.icon className="size-7" />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold">{copy.emptyTitle}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Includes:</p>
                </div>
                <ul className="grid gap-2 text-left text-sm text-muted-foreground sm:grid-cols-2">
                  {copy.emptyItems.map((i) => (
                    <li key={i} className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                      <Check className="size-3.5 text-success" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasOutput && view === "preview" && (
              <div className="prose-output p-5 sm:p-6">
                <MessageResponse isAnimating={loading}>{completion}</MessageResponse>
              </div>
            )}

            {hasOutput && view === "edit" && (
              <div className="flex h-full flex-col p-4">
                <Textarea
                  aria-label="Edit generated output"
                  value={completion}
                  onChange={(e) => setCompletion(e.target.value)}
                  onBlur={() => save(completion, isDemoOutput)}
                  className="min-h-[24rem] flex-1 resize-y rounded-xl bg-background/60 p-4 font-mono text-[0.82rem] leading-relaxed"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Edits are saved to your local history. Markdown formatting is supported.
                </p>
              </div>
            )}
          </div>

          {/* Refine bar */}
          {hasOutput && !loading && (
            <div className="border-t bg-muted/30 p-4">
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {refinements.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRefine(r)}
                    className="rounded-full border bg-card px-2.5 py-1 text-[0.72rem] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {r}
                  </button>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRefine(refineText);
                }}
              >
                <Input
                  value={refineText}
                  onChange={(e) => setRefineText(e.target.value)}
                  placeholder="Refine the result… e.g. “Make action items a checklist”"
                  aria-label="Refinement instruction"
                  className="h-10 rounded-lg bg-card"
                />
                <Button type="submit" variant="brand" size="icon-lg" aria-label="Refine" disabled={!refineText.trim()}>
                  <Send />
                </Button>
              </form>
            </div>
          )}
        </section>
      </div>

      <AiDisclaimer className="mt-6" />
    </div>
  );
}

function ViewTab({
  active,
  children,
  ...props
}: { active: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all disabled:opacity-50",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function IconAction({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function OptionField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function MeetingOptionsPanel() {
  const { meeting } = useLocalStore(prefsStore);
  const update = (patch: Partial<typeof meeting>) =>
    prefsStore.set((p) => ({ ...p, meeting: { ...p.meeting, ...patch } }));
  return (
    <div className="grid gap-3 rounded-xl bg-muted/50 p-3 sm:grid-cols-2">
      <OptionField label="Detail level">
        <Select value={meeting.detail} onValueChange={(v) => update({ detail: v as typeof meeting.detail })}>
          <SelectTrigger className="h-9 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brief">Brief</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
          </SelectContent>
        </Select>
      </OptionField>
      <OptionField label="Tone">
        <Select value={meeting.tone} onValueChange={(v) => update({ tone: v as typeof meeting.tone })}>
          <SelectTrigger className="h-9 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="neutral and professional">Professional</SelectItem>
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
          </SelectContent>
        </Select>
      </OptionField>
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg bg-card px-3 py-2 sm:col-span-2">
        <span className="text-sm font-medium">Include follow-up email draft</span>
        <Switch checked={meeting.includeFollowUp} onCheckedChange={(v) => update({ includeFollowUp: v })} />
      </label>
    </div>
  );
}

function ResearchOptionsPanel() {
  const { research } = useLocalStore(prefsStore);
  const update = (patch: Partial<typeof research>) =>
    prefsStore.set((p) => ({ ...p, research: { ...p.research, ...patch } }));
  return (
    <div className="grid gap-3 rounded-xl bg-muted/50 p-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-card p-1">
          {(["topic", "article"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => update({ mode: m })}
              className={cn(
                "rounded-md py-1.5 text-xs font-semibold transition-all",
                research.mode === m
                  ? "bg-gradient-research text-ink shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "topic" ? "Research a topic" : "Analyse an article"}
            </button>
          ))}
        </div>
      </div>
      <OptionField label="Depth">
        <Select value={research.depth} onValueChange={(v) => update({ depth: v as typeof research.depth })}>
          <SelectTrigger className="h-9 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brief">Quick brief</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="deep">In-depth</SelectItem>
          </SelectContent>
        </Select>
      </OptionField>
      <OptionField label="Audience">
        <Input
          value={research.audience}
          maxLength={120}
          onChange={(e) => update({ audience: e.target.value })}
          onBlur={(e) => !e.target.value.trim() && update({ audience: "Business leaders and managers" })}
          className="h-9 bg-card"
        />
      </OptionField>
    </div>
  );
}
