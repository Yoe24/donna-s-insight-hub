import { LayoutDashboard, Settings, FolderOpen, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Accueil", url: "/dashboard", icon: LayoutDashboard },
  { title: "Configurez-moi", url: "/configuration", icon: Settings },
  { title: "Mes dossiers", url: "/dossiers", icon: FolderOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem("donna_user_id");
    localStorage.removeItem("donna_chat_history");
    await signOut();
    window.location.replace("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="px-4 py-6">
        <Link to="/dashboard">
          <h2 className="text-xl font-serif font-bold text-sidebar-foreground">
            {collapsed ? "D" : "Donna"}
          </h2>
        </Link>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50 rounded-md px-3 py-2 text-sm font-sans text-sidebar-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-sans">
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
