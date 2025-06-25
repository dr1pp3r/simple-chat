"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export function NavThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="hidden dark:flex"
          onClick={() => setTheme("light")}
        >
          <SunIcon />
          <span>Switch to light mode</span>
        </SidebarMenuButton>
        <SidebarMenuButton
          className="dark:hidden"
          onClick={() => setTheme("dark")}
        >
          <MoonIcon />
          <span>Switch to dark mode</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
