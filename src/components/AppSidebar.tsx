import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, Settings, LogOut, Mail, InboxIcon, MoreHorizontal, Pencil, ArrowRightLeft, Trash2, Tag } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDossiers } from "@/hooks/useDossiers";
import { useDemoMode } from "@/hooks/useDemoMode";
import { dossiers as mockDossiersList } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

const navItems = [
  { title: "Briefing", url: "/dashboard", icon: LayoutDashboard },
  { title: "Fil d'actualité", url: "/fil", icon: Mail },
  { title: "Configurez-moi", url: "/configuration", icon: Settings },
];

const DOMAINES = [
  "Droit du travail",
  "Droit de la famille",
  "Droit immobilier",
  "Droit commercial",
  "Droit des successions",
  "Droit pénal",
  "Bail commercial",
  "Gestion cabinet",
  "Autre",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface BriefDossier {
  dossier_id: string;
  needs_immediate_attention: boolean;
  new_emails_count: number;
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { dossiers: liveDossiers, loading: liveLoading } = useDossiers();
  const { isDemo } = useDemoMode();
  const navigate = useNavigate();
  const location = useLocation();

  // Brief data
  const [briefDossiers, setBriefDossiers] = useState<BriefDossier[]>([]);
  const [unclassifiedCount, setUnclassifiedCount] = useState(0);

  // Dossier management state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [localDossiers, setLocalDossiers] = useState<any[]>([]);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Build dossier list
  const demoDossiers = mockDossiersList.map((d) => ({
    id: d.id,
    nom_client: d.nomClient,
    email_client: "",
    statut: d.statut,
    domaine: d.categorie,
    dernier_echange_date: "",
    nouveaux_emails: d.nombreMails,
  }));

  const sourceDossiers = isDemo ? demoDossiers : liveDossiers;
  const loading = isDemo ? false : liveLoading;

  // Sync local dossiers with source
  useEffect(() => {
    setLocalDossiers(sourceDossiers);
  }, [sourceDossiers]);

  useEffect(() => {
    if (isDemo) return;
    const fetchBriefData = async () => {
      try {
        const brief = await apiGet<any>("/api/briefs/today");
        setBriefDossiers(brief?.content?.dossiers || []);
      } catch { /* silent */ }
      try {
        const emails = await apiGet<any[]>("/api/emails");
        const unclassified = (emails || []).filter((e) => !e.dossier_id);
        setUnclassifiedCount(unclassified.length);
      } catch { /* silent */ }
    };
    fetchBriefData();
    const interval = setInterval(fetchBriefData, 60000);
    return () => clearInterval(interval);
  }, [isDemo]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const getBriefInfo = (dossierId: string) => {
    return briefDossiers.find((bd) => bd.dossier_id === dossierId);
  };

  const handleLogout = async () => {
    localStorage.removeItem("donna_user_id");
    localStorage.removeItem("donna_chat_history");
    localStorage.removeItem("donna_demo_mode");
    await signOut();
    window.location.replace("/login");
  };

  const handleRenameStart = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const handleRenameConfirm = (id: string) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    setLocalDossiers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, nom_client: renameValue.trim() } : d))
    );
    toast.success("Dossier renommé");
    setRenamingId(null);
  };

  const handleChangeDomaine = (id: string, domaine: string) => {
    setLocalDossiers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, domaine } : d))
    );
    toast.success("Domaine mis à jour");
  };

  const handleMerge = (sourceId: string, targetId: string) => {
    const target = localDossiers.find((d) => d.id === targetId);
    setLocalDossiers((prev) => prev.filter((d) => d.id !== sourceId));
    toast.success(`Dossier fusionné avec ${target?.nom_client || "un autre dossier"}`);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setLocalDossiers((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    toast.success("Dossier supprimé");
    setDeleteTarget(null);
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border">
        <div className="px-4 py-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold text-sidebar-foreground">
              {collapsed ? "D" : "Donna"}
            </h2>
            {!collapsed && (
              <Badge
                className={cn(
                  "text-[9px] font-semibold px-1.5 py-0 h-4 rounded",
                  isDemo
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-emerald-100 text-emerald-700 border-emerald-200"
                )}
                variant="outline"
              >
                {isDemo ? "DÉMO" : "LIVE"}
              </Badge>
            )}
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
                  ) : localDossiers.length === 0 ? (
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
                    localDossiers.map((dossier) => {
                      const active = location.pathname === `/dossiers/${dossier.id}`;
                      const briefInfo = getBriefInfo(dossier.id);
                      const newEmails = briefInfo?.new_emails_count ?? 0;
                      const isRenaming = renamingId === dossier.id;

                      return (
                        <SidebarMenuItem key={dossier.id} className="group/dossier relative">
                          <SidebarMenuButton
                            isActive={active}
                            onClick={() => {
                              if (!isRenaming) navigate(`/dossiers/${dossier.id}`);
                            }}
                            className={cn(
                              "w-full rounded-md px-2 py-2 text-sm font-sans transition-colors cursor-pointer",
                              active
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2 w-full min-w-0">
                              <div className="shrink-0">
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
                              </div>

                              {!collapsed && (
                                <div className="flex-1 min-w-0">
                                  {isRenaming ? (
                                    <Input
                                      ref={renameInputRef}
                                      className="h-6 text-sm px-1 py-0 border-primary"
                                      value={renameValue}
                                      onChange={(e) => setRenameValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        e.stopPropagation();
                                        if (e.key === "Enter") handleRenameConfirm(dossier.id);
                                        if (e.key === "Escape") setRenamingId(null);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      onBlur={() => handleRenameConfirm(dossier.id)}
                                    />
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-1.5">
                                        <span className="truncate text-sm font-medium leading-tight">
                                          {dossier.nom_client}
                                        </span>
                                        {newEmails > 0 && (
                                          <span className="inline-flex items-center justify-center h-4 min-w-[16px] rounded-full bg-foreground/10 text-[10px] font-semibold text-foreground px-1">
                                            {newEmails}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-muted-foreground truncate block">
                                        {dossier.domaine || "—"}
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </SidebarMenuButton>

                          {/* Context menu trigger */}
                          {!collapsed && !isRenaming && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover/dossier:opacity-100 hover:bg-sidebar-accent transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleRenameStart(dossier.id, dossier.nom_client)}
                                >
                                  <Pencil className="h-3.5 w-3.5 mr-2" />
                                  Renommer
                                </DropdownMenuItem>

                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <Tag className="h-3.5 w-3.5 mr-2" />
                                    Changer le domaine
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="w-48">
                                    {DOMAINES.map((dom) => (
                                      <DropdownMenuItem
                                        key={dom}
                                        onClick={() => handleChangeDomaine(dossier.id, dom)}
                                        className={cn(
                                          dossier.domaine === dom && "font-medium text-primary"
                                        )}
                                      >
                                        {dom}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <ArrowRightLeft className="h-3.5 w-3.5 mr-2" />
                                    Fusionner avec…
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="w-48">
                                    {localDossiers
                                      .filter((d) => d.id !== dossier.id)
                                      .map((d) => (
                                        <DropdownMenuItem
                                          key={d.id}
                                          onClick={() => handleMerge(dossier.id, d.id)}
                                        >
                                          {d.nom_client}
                                        </DropdownMenuItem>
                                      ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    setDeleteTarget({ id: dossier.id, name: dossier.nom_client })
                                  }
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </SidebarMenuItem>
                      );
                    })
                  )}
                </SidebarMenu>
              </ScrollArea>

              {/* Emails non classés */}
              {!collapsed && unclassifiedCount > 0 && !isDemo && (
                <div className="px-3 pt-2 pb-1">
                  <button
                    onClick={() => navigate("/fil?filter=unclassified")}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                  >
                    <InboxIcon className="h-3.5 w-3.5" />
                    <span>Emails non classés ({unclassifiedCount})</span>
                  </button>
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 space-y-3">
          {!collapsed && isDemo && (
            <Link
              to="/login"
              onClick={() => localStorage.removeItem("donna_demo_mode")}
              className="text-xs text-primary hover:underline font-sans"
            >
              Connecter Gmail pour de vrais dossiers →
            </Link>
          )}

          <button
            onClick={() => setShowLogoutDialog(true)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-sans"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* Logout dialog */}
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

      {/* Delete dossier confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le dossier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les emails de « {deleteTarget?.name} » seront marqués comme non classés. Confirmer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-3 sm:justify-end">
            <AlertDialogCancel className="mt-0">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
