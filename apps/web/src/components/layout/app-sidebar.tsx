"use client";

import * as React from "react";
import { NavUser } from "@/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NavHeader } from "@/components/layout/nav-header";
import { NavActions } from "@/components/layout/nav-actions";
import { NavChatHistory } from "@/components/layout/nav-chat-history";
import type { User } from "better-auth";
import { NavThemeToggle } from "@/components/layout/nav-theme-toggle";

export function AppSidebar({
  user,
  ...props
}: { user: User } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <NavHeader />
      <SidebarContent>
        <NavActions />
        <NavChatHistory />
      </SidebarContent>
      <SidebarFooter>
        <NavThemeToggle />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
