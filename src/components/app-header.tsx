import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { aiStatusQuery } from "@/lib/ai-status.functions";
import { DASHBOARD_NAV, NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current =
    NAV_ITEMS.find((i) => (i.url === "/" ? pathname === "/" : pathname.startsWith(i.url))) ??
    DASHBOARD_NAV;

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur-md sm:px-5">
      <SidebarTrigger className="size-9" aria-label="Toggle sidebar" />
      <div className="h-5 w-px bg-border" />
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn("size-2 shrink-0 rounded-full", current.gradient)} />
        <p className="truncate font-display text-[0.95rem] font-semibold">{current.title}</p>
      </div>
      <div className="ml-auto">
        <AiStatusBadge />
      </div>
    </header>
  );
}

export function AiStatusBadge() {
  const { data } = useSuspenseQuery(aiStatusQuery);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
            data.live
              ? "border-success/30 bg-success/10 text-success"
              : "border-brand-orange/40 bg-warning text-warning-foreground",
          )}
        >
          <span className="relative flex size-2">
            {data.live && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            )}
            <span
              className={cn(
                "relative inline-flex size-2 rounded-full",
                data.live ? "bg-success" : "bg-brand-orange",
              )}
            />
          </span>
          {data.live ? "Live AI" : "Demo mode"}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-64">
        {data.live
          ? "Responses are generated live by AI. Always review them before use."
          : "No AI service is configured. Outputs are rule-based examples, not real AI responses."}
      </TooltipContent>
    </Tooltip>
  );
}
