import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PageTransition } from "@/components/PageTransition";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 h-14 flex items-center border-b border-border px-4 bg-background/80 backdrop-blur-xl">
            <SidebarTrigger className="text-muted-foreground" />
            <span className="ml-4 text-lg font-serif font-bold tracking-tight text-foreground">Donna</span>
          </header>
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto bg-muted/30">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
