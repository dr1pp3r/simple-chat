import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MobileHeader } from "@/components/layout/mobile-header";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset className="overflow-hidden">
        <MobileHeader />
        <main className="flex-1 pt-8 md:pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
