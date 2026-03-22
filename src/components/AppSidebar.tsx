import { useState } from "react";
import { LayoutDashboard, Settings, LogOut, Mail, Paperclip } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDossiers } from "@/hooks/useDossiers";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Accueil", url: "/dashboard", icon: LayoutDashboard },
  { title: "Fil d'actualité", url: "/fil", icon: Mail },
  { title: "Configurez-moi", url: "/configuration", icon: Settings },
];

const statutColor: Record<string, string> = {
  actif: "bg-green-500",
  en_attente: "bg-orange-400",
  archive: "bg-muted-foreground/40",
};

function isRecent(dateStr: string | undefined) {
  if (!dateStr) return false;
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff < 24 * 60 * 60 * 1000;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { dossiers, loading } = useDossiers();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    localStorage.removeItem("donna_user_id");
    localStorage.removeItem("donna_chat_history");
    localStorage.removeItem("donna_demo_mode");
    await signOut();
    window.location.replace("/login");
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border">
        <div className="px-4 py-6">
          <Link to="/dashboard">
            <h2 className="text-xl font-serif font-bold text-sidebar-foreground">
              {collapsed ? "D" : "Donna"}
            </h2>
          </Link>
        </div>

        <SidebarContent>
          {/* Navigation principale */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
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

          {/* Dossiers dynamiques */}
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70 px-3">
                Dossiers
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <ScrollArea className="flex-1 overflow-y-auto">
                <SidebarMenu>
                  {loading ? (
                    /* Skeletons */
                    Array.from({ length: 4 }).map((_, i) => (
                      <SidebarMenuItem key={i}>
                        <div className="flex items-center gap-2 px-3 py-2">
                          <div className="h-7 w-7 rounded-full bg-muted animate-pulse shrink-0" />
                          {!collapsed && (
                            <div className="flex-1 space-y-1">
                              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                              <div className="h-2 w-16 bg-muted animate-pulse rounded" />
                            </div>
                          )}
                        </div>
                      </SidebarMenuItem>
                    ))
                  ) : dossiers.length === 0 ? (
                    !collapsed && (
                      <div className="px-3 py-4 text-center">
                        <p className="text-xs text-muted-foreground">Aucun dossier</p>
                        <Link
                          to="/configuration"
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                          Connecter Gmail
                        </Link>
                      </div>
                    )
                  ) : (
                    dossiers.map((dossier) => {
                      const active = location.pathname === `/dossiers/${dossier.id}`;
                      const recent = isRecent(dossier.dernier_echange_date);
                      const hasNewEmails = (dossier.nouveaux_emails ?? 0) > 0;
                      const hasNewPieces = (dossier.nouvelles_pieces ?? 0) > 0;
                      const hasNotif = hasNewEmails || hasNewPieces || recent;

                      return (
                        <SidebarMenuItem key={dossier.id}>
                          <SidebarMenuButton
                            isActive={active}
                            onClick={() => navigate(`/dossiers/${dossier.id}`)}
                            className={cn(
                              "w-full rounded-md px-2 py-2 text-sm font-sans transition-colors cursor-pointer",
                              active
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2 w-full min-w-0">
                              {/* Avatar / Initiale */}
                              <div className="relative shrink-0">
                                <div
                                  className={cn(
                                    "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold",
                                    active
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {getInitials(dossier.nom_client)}
                                </div>
                                {/* Status dot */}
                                <span
                                  className={cn(
                                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar",
                                    statutColor[dossier.statut] || "bg-muted-foreground/40"
                                  )}
                                />
                              </div>

                              {!collapsed && (
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="truncate text-sm font-medium leading-tight">
                                      {dossier.nom_client}
                                    </span>
                                    {hasNotif && (
                                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                    )}
                                  </div>

                                  {/* Notification badges */}
                                  {(hasNewEmails || hasNewPieces) ? (
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {hasNewEmails && (
                                        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                          <Mail className="h-2.5 w-2.5" />
                                          +{dossier.nouveaux_emails}
                                        </span>
                                      )}
                                      {hasNewPieces && (
                                        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                          <Paperclip className="h-2.5 w-2.5" />
                                          +{dossier.nouvelles_pieces}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground truncate block">
                                      {dossier.domaine || "—"}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })
                  )}
                </SidebarMenu>
              </ScrollArea>

            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-sans"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg">
              Voulez-vous vraiment vous déconnecter ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-muted-foreground">
              Vous devrez vous reconnecter pour accéder à votre espace Donna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-center gap-3 sm:justify-center">
            <AlertDialogCancel className="mt-0 border-muted-foreground/30 hover:bg-muted">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
