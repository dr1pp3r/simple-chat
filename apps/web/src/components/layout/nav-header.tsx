"use client";

import { PanelLeftIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AppBrand } from "@/components/app-brand";

export function NavHeader() {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem className="relative overflow-hidden flex items-center gap-0">
          <AppBrand className="absolute left-0 transition-opacity duration-200 transition-transform duration-400 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:translate-x-[-250%]" />
          <Button
            size="icon"
            className="h-8 w-8 ml-auto group-data-[collapsible=icon]:ml-0 shrink-0 cursor-pointer z-10"
            variant="ghost"
            onClick={toggleSidebar}
          >
            {isMobile ? <XIcon /> : <PanelLeftIcon />}
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}
