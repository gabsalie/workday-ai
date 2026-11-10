import { ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export function AiDisclaimer({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-border bg-card/60 text-muted-foreground",
        compact ? "px-3 py-2 text-[0.72rem]" : "px-4 py-3 text-xs",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-brand-orange" />
      <p className="leading-relaxed">
        <span className="font-semibold text-foreground">Responsible AI: </span>
        AI-generated content may contain errors, omissions or outdated information. Review and verify
        it before using it for workplace decisions, and avoid pasting confidential data you aren't
        permitted to share.
      </p>
    </div>
  );
}
