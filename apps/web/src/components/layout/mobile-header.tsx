"use client";

import { PanelLeftIcon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppBrand } from "@/components/app-brand";

export function MobileHeader() {
  const { setOpenMobile } = useSidebar();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background md:hidden">
      <div className="flex h-full items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpenMobile(true)}
          className="size-9"
          aria-label="Open navigation"
        >
          <PanelLeftIcon className="size-5" />
        </Button>
        
        <AppBrand className="ml-3" />
      </div>
    </header>
  );
}