import { LayoutDashboard, MessagesSquare, NotebookPen, Telescope, type LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  short: string;
  description: string;
  url: "/" | "/meetings" | "/research" | "/chat";
  icon: LucideIcon;
  gradient: string;
};

export const DASHBOARD_NAV: NavItem = {
  title: "Dashboard",
  short: "Dashboard",
  description: "Overview and recent activity",
  url: "/",
  icon: LayoutDashboard,
  gradient: "bg-spectrum",
};

const MEETING_NAV: NavItem = {
  title: "Meeting Summarizer",
  short: "Meetings",
  description: "Turn notes into decisions and action items",
  url: "/meetings",
  icon: NotebookPen,
  gradient: "bg-gradient-meeting",
};

const RESEARCH_NAV: NavItem = {
  title: "Research Assistant",
  short: "Research",
  description: "Summaries, insights and recommendations",
  url: "/research",
  icon: Telescope,
  gradient: "bg-gradient-research",
};

const CHAT_NAV: NavItem = {
  title: "AI Chat",
  short: "AI Chat",
  description: "Ask, draft and solve workplace problems",
  url: "/chat",
  icon: MessagesSquare,
  gradient: "bg-gradient-chat",
};

export const NAV_ITEMS: NavItem[] = [DASHBOARD_NAV, MEETING_NAV, RESEARCH_NAV, CHAT_NAV];

export const TOOL_NAV = {
  meeting: MEETING_NAV,
  research: RESEARCH_NAV,
  chat: CHAT_NAV,
} as const;
