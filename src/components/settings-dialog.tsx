import { Settings2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { CHAT_STORAGE_KEY, historyStore, prefsStore, useLocalStore } from "@/lib/storage";

export function SettingsDialog() {
  const prefs = useLocalStore(prefsStore);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(prefs.name);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setName(prefsStore.get().name);
      }}
    >
      <DialogTrigger asChild>
        <SidebarMenuButton tooltip="Preferences" className="h-10 rounded-lg">
          <Settings2 className="size-4" />
          <span>Preferences</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Preferences</DialogTitle>
          <DialogDescription>
            Saved only in this browser. Nothing is sent to a server.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="pref-name">Your first name</Label>
          <Input
            id="pref-name"
            value={name}
            maxLength={40}
            placeholder="e.g. Alex"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="rounded-xl border bg-muted/50 p-4">
          <p className="text-sm font-semibold">Local history</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Removes saved summaries, research and the chat conversation from this browser.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 text-destructive"
            onClick={() => {
              historyStore.set([]);
              window.localStorage.removeItem(CHAT_STORAGE_KEY);
              toast.success("Local history cleared");
            }}
          >
            <Trash2 /> Clear all history
          </Button>
        </div>
        <DialogFooter>
          <Button
            variant="brand"
            onClick={() => {
              prefsStore.set((p) => ({ ...p, name: name.trim() }));
              setOpen(false);
              toast.success("Preferences saved");
            }}
          >
            Save preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
