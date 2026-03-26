import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PageTransition } from "@/components/PageTransition";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 h-12 flex items-center px-4 bg-background/80 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none">
            <SidebarTrigger className="text-muted-foreground" />
          </header>
          <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 md:p-8 md:pb-24 overflow-auto bg-background">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
