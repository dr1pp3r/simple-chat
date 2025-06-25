import Link from "next/link";
import { PlusIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function NavActions() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="font-medium bg-accent/90 text-primary hover:bg-accent/50 hover:text-primary active:bg-accent/50 active:text-primary min-w-8 duration-200 ease-linear"
              asChild
            >
              <Link href="/">
                <PlusIcon />
                <span>New Conversation</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
