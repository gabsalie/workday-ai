export type ToolId = "meeting" | "research";

export type MeetingOptions = {
  detail: "brief" | "standard" | "detailed";
  tone: "neutral and professional" | "friendly" | "formal";
  includeFollowUp: boolean;
};

export type ResearchOptions = {
  mode: "topic" | "article";
  depth: "brief" | "standard" | "deep";
  audience: string;
};

export const DEFAULT_MEETING_OPTIONS: MeetingOptions = {
  detail: "standard",
  tone: "neutral and professional",
  includeFollowUp: false,
};

export const DEFAULT_RESEARCH_OPTIONS: ResearchOptions = {
  mode: "topic",
  depth: "standard",
  audience: "Business leaders and managers",
};

export const MAX_INPUT_CHARS = 60000;

export type Sample = { label: string; text: string };

export const MEETING_SAMPLES: Sample[] = [
  {
    label: "Product sprint planning",
    text: `Sprint 14 planning – Tue 4 Nov, 10:00
Attendees: Priya (PM), Marcus (Eng lead), Lena (Design), Tom (QA), Aisha (Marketing)

Priya opened: goal for this sprint is to ship the new onboarding checklist before the 28 Nov launch webinar.
Marcus said backend for checklist progress is 70% done but the analytics events aren't wired yet. Estimates 3 more days.
Lena shared new designs for empty states – team liked option B. Decision: go with option B.
Tom raised concern that we have no automated tests on the signup flow. Agreed Tom will write e2e tests for signup + checklist by 14 Nov.
Aisha needs final screenshots for the webinar deck by 20 Nov. Lena to provide.
Discussion on whether to include the "invite teammates" step – Marcus worried about scope. Decided to cut it from this sprint and revisit in Sprint 15.
Marcus to wire analytics events by Friday 7 Nov.
Priya will update the roadmap and notify customer success about the launch date.
Open question: do we need legal review for the new email copy? Nobody sure – Priya to check with legal.
Next check-in Thursday.`,
  },
  {
    label: "Client kickoff call",
    text: `Kickoff call with Northwind Logistics — 3 Nov
Us: Daniel (account lead), Sofia (solutions architect). Them: Grace Kim (COO), Raj (IT manager)

Grace explained their main pain: dispatchers spend ~2 hrs/day manually reconciling delivery data across 3 systems.
They want a pilot in the Cape Town depot first, then roll out to 4 more depots in Q1.
Raj: their ERP API is rate-limited, and SSO via Azure AD is mandatory.
Sofia proposed a nightly sync + real-time webhook for exceptions. Grace was keen.
Budget: Grace said approved for pilot, full rollout depends on pilot ROI (target: cut reconciliation time by 50%).
Agreed: pilot runs 6 weeks starting 1 Dec.
Daniel to send SOW and pricing by 10 Nov. Sofia to send technical architecture doc by 12 Nov.
Raj to provide API sandbox credentials and rate-limit docs this week.
Risk: holiday season volume could stress the pilot. Grace will confirm which weeks are blackout periods.`,
  },
  {
    label: "Weekly leadership sync",
    text: `Leadership sync 6 Nov. Present: Helen (CEO), Omar (CFO), Jess (Head of People), Kofi (CTO)
- Q3 revenue came in 4% under forecast, mostly due to delayed enterprise deals. Omar wants to tighten forecasting.
- Hiring: 6 open roles, 2 offers out. Jess flagged long time-to-hire for senior engineers (avg 58 days).
- Decision: freeze non-critical hiring until Q1 budget sign-off. Engineering backfills exempt.
- Kofi proposed moving to quarterly security audits after the recent phishing incident. Approved.
- Office move: lease ends March. Helen asked Omar to bring 2 options to next meeting.
- Jess to run engagement survey before end of month.
- Kofi to present cloud cost reduction plan on 20 Nov.`,
  },
];

export const RESEARCH_SAMPLES: Sample[] = [
  { label: "Hybrid work productivity", text: "What does the evidence say about productivity in hybrid vs fully remote vs in-office teams, and how should a mid-sized company design its hybrid policy?" },
  { label: "AI adoption in SMEs", text: "How can a small or mid-sized business adopt generative AI responsibly in the next 6 months? Cover use cases, risks, costs and governance." },
  { label: "Four-day work week", text: "Pros, cons and real-world results of a four-day work week. What should leaders consider before running a trial?" },
  { label: "OKRs vs KPIs", text: "Explain the difference between OKRs and KPIs, when to use each, and common mistakes teams make when implementing OKRs." },
];

export const CHAT_SAMPLES: string[] = [
  "Draft a polite email declining a meeting and proposing a new time next week",
  "Help me prioritise 8 tasks using the Eisenhower matrix",
  "How do I give constructive feedback to a colleague who misses deadlines?",
  "Write a one-page project status update template",
  "Suggest an agenda for a 30-minute quarterly review",
  "Explain how to calculate ROI for a new software tool",
];

export const MEETING_REFINEMENTS = [
  "Make it shorter and more executive-friendly",
  "Add a follow-up email to attendees",
  "Highlight risks and blockers more clearly",
  "Group action items by owner",
];

export const RESEARCH_REFINEMENTS = [
  "Simplify for a non-expert audience",
  "Add a pros and cons table",
  "Turn recommendations into a 30-60-90 day plan",
  "Make it more concise",
];
