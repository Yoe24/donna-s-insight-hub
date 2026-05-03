import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PageTransition } from "@/components/PageTransition";
import { BannerReconnectGmail } from "@/components/BannerReconnectGmail";
import { NavLink, useLocation } from "react-router-dom";

const TOP_NAV = [
  { label: "Calendrier", to: "/lab/calendar", match: ["/lab/calendar", "/lab"] },
  { label: "Briefing", to: "/dashboard", match: ["/dashboard"] },
];

function TopNav() {
  const { pathname } = useLocation();
  return (
    <nav className="flex items-end gap-6 px-4 sm:px-6 md:px-8 border-b">
      {TOP_NAV.map((item) => {
        const active = item.match.some((p) => pathname.startsWith(p));
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`pb-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <BannerReconnectGmail />
          <header className="sticky top-0 z-40 h-12 flex items-center px-4 bg-background/80 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none">
            <SidebarTrigger className="text-muted-foreground" />
          </header>
          <TopNav />
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
