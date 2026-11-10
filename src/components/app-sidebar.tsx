import { Link, useRouterState } from "@tanstack/react-router";

import logoMark from "@/assets/logo-mark.png";
import { SettingsDialog } from "@/components/settings-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { setOpenMobile, isMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="px-3 pt-4 pb-2">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <img src={logoMark} alt="" width={36} height={36} className="size-9 shrink-0" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="font-display text-[0.95rem] font-bold leading-tight text-sidebar-accent-foreground">
              Workplace AI
            </p>
            <p className="truncate text-[0.7rem] text-sidebar-foreground/70">
              Productivity Assistant
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <div className="mx-4 h-px bg-spectrum opacity-60 group-data-[collapsible=icon]:mx-2" />

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_ITEMS.map((item) => {
                const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="h-10 rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold"
                    >
                      <Link to={item.url} onClick={() => isMobile && setOpenMobile(false)}>
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-md transition-all",
                            active ? `${item.gradient} text-ink` : "text-sidebar-foreground",
                          )}
                        >
                          <item.icon className="size-4" />
                        </span>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SettingsDialog />
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="px-2 text-[0.68rem] leading-snug text-sidebar-foreground/55 group-data-[collapsible=icon]:hidden">
          AI output can be wrong. Review before using it for workplace decisions.
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
