import Link from "next/link";
import { PandaIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppBrand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 self-center font-medium",
        className,
      )}
    >
      <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
        <PandaIcon className="size-4" />
      </div>
      simple chat
    </Link>
  );
}
