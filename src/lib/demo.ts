/**
 * Demo mode: used only when no AI service is configured.
 * These outputs come from simple text rules — they are clearly labelled and are NOT AI-generated.
 */
import type { MeetingOptions, ResearchOptions } from "@/lib/tools";

export const DEMO_BANNER =
  "> **Demo mode** — this output was produced by simple text rules, not AI. Connect an AI key to get real, context-aware results.";

const DATE_RE =
  /\b(?:by\s+)?(?:(?:mon|tues|wednes|thurs|fri|satur|sun)day(?:\s+\d{1,2}\s+\w{3,9})?|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}|end of (?:the )?(?:week|month|quarter)|this week|next week|q[1-4])\b/i;

function splitLines(text: string) {
  return text
    .split(/\n|(?<=[.!?])\s+(?=[A-Z])/)
    .map((l) => l.replace(/^[\s\-–•*]+/, "").trim())
    .filter((l) => l.length > 3);
}

function ownerOf(line: string) {
  const m = line.match(/^([A-Z][a-z]+)(?:\s*\([^)]*\))?\s+(?:to|will|needs to|is going to)\b/);
  if (m) return m[1];
  const agreed = line.match(/\b([A-Z][a-z]+)\s+(?:will|to)\s+(?:write|send|provide|wire|update|run|present|check|bring|confirm)/);
  return agreed?.[1] ?? "Unassigned";
}

export function demoMeetingSummary(notes: string, opts: MeetingOptions) {
  const lines = splitLines(notes);
  const header = lines[0] ?? "Meeting";
  const attendees = lines.find((l) => /^(attendees|present|participants|us:)/i.test(l));
  const decisions = lines.filter((l) => /\b(decid|decision|agreed|approved|go with)\w*/i.test(l));
  const actions = lines.filter(
    (l) => /^[A-Z][a-z]+(?:\s*\([^)]*\))?\s+(?:to|will|needs to)\b/.test(l) || /\b\w+ (?:will|to) (?:write|send|provide|wire|update|run|present|check|bring|confirm)\b/.test(l),
  );
  const risks = lines.filter((l) => /\b(risk|concern|worried|blocker|open question|unsure|not sure|flag)\w*/i.test(l));
  const used = new Set([header, attendees, ...decisions, ...actions, ...risks]);
  const discussion = lines.filter((l) => !used.has(l)).slice(0, opts.detail === "brief" ? 3 : 7);
  const dated = lines.filter((l) => DATE_RE.test(l));

  const rows = actions.map((a, i) => {
    const deadline = a.match(DATE_RE)?.[0] ?? "Not specified";
    return `| ${i + 1} | ${a.replace(/\|/g, "/")} | ${ownerOf(a)} | ${deadline} | Medium |`;
  });

  const byOwner = new Map<string, string[]>();
  actions.forEach((a) => {
    const o = ownerOf(a);
    byOwner.set(o, [...(byOwner.get(o) ?? []), a]);
  });

  return `${DEMO_BANNER}

## Meeting Overview
**${header}**${attendees ? ` — ${attendees}` : ""}. ${lines.length} note lines were scanned for decisions, actions and risks.

## Key Discussion Points
${discussion.map((d) => `- ${d}`).join("\n") || "- Not specified"}

## Decisions Made
${decisions.map((d, i) => `${i + 1}. ${d}`).join("\n") || "No explicit decisions detected."}

## Action Items
| # | Action | Owner | Deadline | Priority |
|---|---|---|---|---|
${rows.join("\n") || "| – | No action items detected | Unassigned | Not specified | – |"}

## Responsibilities by Person
${[...byOwner].map(([o, items]) => `**${o}**\n${items.map((i) => `- ${i}`).join("\n")}`).join("\n\n") || "Not specified"}

## Deadlines & Timeline
${dated.map((d) => `- ${d}`).join("\n") || "- No dates detected"}

## Open Questions & Risks
${risks.map((r) => `- ${r}`).join("\n") || "- None detected"}
`;
}

export function demoResearch(input: string, opts: ResearchOptions) {
  if (opts.mode === "article") {
    const sentences = input
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 40);
    const ranked = [...sentences]
      .sort((a, b) => score(b) - score(a))
      .slice(0, opts.depth === "brief" ? 4 : 7);
    return `${DEMO_BANNER}

## Executive Summary
${sentences.slice(0, 2).join(" ") || "The pasted content was too short to summarise."}

## Key Insights
${ranked.map((s, i) => `${i + 1}. ${s}`).join("\n") || "1. Not enough content detected."}

## Practical Takeaways
- [ ] Review the insights above against your own context
- [ ] Identify one action you can take this week
- [ ] Share the summary with the stakeholders for **${opts.audience}**

## Caveats & What to Verify
- Demo mode only extracts sentences from the source — it does not interpret or verify them.
`;
  }
  const topic = input.trim().replace(/\?$/, "");
  return `${DEMO_BANNER}

## Executive Summary
A structured research outline for **"${topic}"**, written for ${opts.audience.toLowerCase()}. In live mode, this section contains a real synthesis of the topic.

## Key Insights
1. **Define the question** — clarify what decision this research should inform.
2. **Map the landscape** — identify the main approaches, players and evidence.
3. **Weigh trade-offs** — compare costs, benefits and risks of each option.
4. **Check the evidence** — prefer recent, independent sources.

## Recommendations
1. Agree success criteria with stakeholders before acting.
2. Pilot the most promising option at small scale.
3. Review results after a fixed period and decide whether to scale.

## Practical Takeaways
- [ ] Write a one-sentence problem statement
- [ ] Gather three credible sources on "${topic}"
- [ ] Draft a short pros/cons list

## Caveats & What to Verify
- This is a generic template from demo mode, not AI analysis of your topic.
`;
}

function score(s: string) {
  let n = 0;
  if (/\d/.test(s)) n += 2;
  if (/\b(should|must|important|key|significant|result|found|show|increase|decrease|because)\b/i.test(s)) n += 2;
  if (s.length > 80 && s.length < 260) n += 1;
  return n;
}

export function demoChatReply(question: string) {
  const q = question.toLowerCase();
  let body = "";
  if (/email|message|reply|letter/.test(q)) {
    body = `Here's a template you could adapt:

**Subject:** [Clear, specific subject]

Hi [Name],

[One sentence on why you're writing.]

[Key details or request — keep it to 2–3 short sentences.]

[Clear next step, e.g. "Could you confirm by Thursday?"]

Kind regards,
[Your name]`;
  } else if (/priorit|task|todo|to-do|eisenhower/.test(q)) {
    body = `A quick prioritisation framework (Eisenhower matrix):

| | Urgent | Not urgent |
|---|---|---|
| **Important** | Do now | Schedule |
| **Not important** | Delegate | Drop |

List your tasks, place each in a quadrant, then block time for the "Schedule" items.`;
  } else if (/feedback|colleague|manager|conflict/.test(q)) {
    body = `Try the **SBI model** for feedback:
1. **Situation** — when and where it happened
2. **Behaviour** — what you observed (facts, not judgements)
3. **Impact** — the effect on you, the team or the work

Then ask an open question and agree a next step together.`;
  } else {
    body = `In live mode I'd answer your question directly using the full conversation context. For now, a general approach:
1. Clarify the outcome you want
2. List the constraints (time, people, budget)
3. Brainstorm 2–3 options and pick the simplest one that works`;
  }
  return `${DEMO_BANNER}\n\n${body}`;
}

/** Reveals text progressively so demo mode still shows the loading/streaming experience. */
export async function simulateStream(
  text: string,
  onUpdate: (partial: string) => void,
  signal: { cancelled: boolean },
) {
  await wait(500);
  const words = text.split(/(\s+)/);
  let out = "";
  for (let i = 0; i < words.length; i += 6) {
    if (signal.cancelled) return out;
    out += words.slice(i, i + 6).join("");
    onUpdate(out);
    await wait(18);
  }
  return out;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
