import { LayoutDashboard, MessagesSquare, NotebookPen, Telescope, type LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  short: string;
  description: string;
  url: "/" | "/meetings" | "/research" | "/chat";
  icon: LucideIcon;
  gradient: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    short: "Dashboard",
    description: "Overview and recent activity",
    url: "/",
    icon: LayoutDashboard,
    gradient: "bg-spectrum",
  },
  {
    title: "Meeting Summarizer",
    short: "Meetings",
    description: "Turn notes into decisions and action items",
    url: "/meetings",
    icon: NotebookPen,
    gradient: "bg-gradient-meeting",
  },
  {
    title: "Research Assistant",
    short: "Research",
    description: "Summaries, insights and recommendations",
    url: "/research",
    icon: Telescope,
    gradient: "bg-gradient-research",
  },
  {
    title: "AI Chat",
    short: "AI Chat",
    description: "Ask, draft and solve workplace problems",
    url: "/chat",
    icon: MessagesSquare,
    gradient: "bg-gradient-chat",
  },
];

export const TOOL_NAV = {
  meeting: NAV_ITEMS[1],
  research: NAV_ITEMS[2],
  chat: NAV_ITEMS[3],
} as const;
