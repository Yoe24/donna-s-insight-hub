/**
 * AppSidebar — Main navigation sidebar
 *
 * Always fetches dossiers and brief data from API using the active user_id.
 * No hardcoded demo data — the API serves demo content for the demo user_id.
 */

import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, Settings, LogOut, Mail, InboxIcon, MoreHorizontal, Pencil, ArrowRightLeft, Trash2, Tag } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDossiers } from "@/hooks/useDossiers";
import { isDemo as isDemoCheck, logout as authLogout } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { apiGet, apiPublicGet } from "@/lib/api";
import { toast } from "sonner";

const navItems = [
  { title: "Briefing", subtitle: "Votre journée en un coup d'œil", url: "/dashboard", icon: LayoutDashboard },
  // TODO: Réactiver le Fil d'actualité post-MVP
  // { title: "Fil d'actualité", subtitle: "Les emails analysés par Donna", url: "/fil", icon: Mail, tourId: "fil" },
  { title: "Configurez-moi", subtitle: "Personnalisez votre assistante", url: "/configuration", icon: Settings },
];

const DOMAINES = [
  "Droit du travail", "Droit de la famille", "Droit immobilier", "Droit commercial",
  "Droit des successions", "Droit pénal", "Bail commercial", "Gestion cabinet", "Autre",
];

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
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
  const { dossiers: liveDossiers, loading } = useDossiers();
  const isDemo = isDemoCheck();
  const navigate = useNavigate();
  const location = useLocation();

  const [briefDossiers, setBriefDossiers] = useState<BriefDossier[]>([]);
  const [unclassifiedCount, setUnclassifiedCount] = useState(0);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [localDossiers, setLocalDossiers] = useState<any[]>([]);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("[AppSidebar] liveDossiers from API:", liveDossiers);
    setLocalDossiers(liveDossiers);
  }, [liveDossiers]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const getBriefInfo = (dossierId: string) => briefDossiers.find((bd) => bd.dossier_id === dossierId);

  const handleLogout = async () => {
    await signOut().catch(() => {});
    authLogout();
  };

  const handleRenameStart = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  const handleRenameConfirm = (id: string) => {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    setLocalDossiers((prev) => prev.map((d) => (d.id === id ? { ...d, nom_client: renameValue.trim() } : d)));
    toast.success("Dossier renommé");
    setRenamingId(null);
  };

  const handleChangeDomaine = (id: string, domaine: string) => {
    setLocalDossiers((prev) => prev.map((d) => (d.id === id ? { ...d, domaine } : d)));
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
          {!collapsed && (
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              À jour · Dernière analyse il y a 2 min
            </p>
          )}
        </div>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title} {...((item as any).tourId ? { "data-tour": (item as any).tourId } : {})}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-sidebar-accent/50 rounded-lg px-3 py-2 text-sm font-sans text-sidebar-foreground transition-colors duration-200"
                        activeClassName="bg-primary/10 text-sidebar-accent-foreground font-medium border-l-2 border-primary"
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {!collapsed && (
                          <div>
                            <span>{item.title}</span>
                            {item.subtitle && <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{item.subtitle}</p>}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup data-tour="dossiers">
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
                        <Link to="/configuration" className="text-xs text-primary hover:underline mt-1 inline-block">
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
                            onPointerDown={(e) => {
                              // onPointerDown se déclenche avant les handlers internes
                              // du composant Sidebar, évitant le double-clic
                              if (!isRenaming && e.button === 0) {
                                e.preventDefault();
                                navigate(`/dossiers/${dossier.id}`);
                              }
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
                                <div className={cn(
                                  "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold",
                                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
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
                                        <span className="truncate text-sm font-medium leading-tight">{dossier.nom_client}</span>
                                        {newEmails > 0 && (
                                          <span className="inline-flex items-center justify-center h-4 min-w-[16px] rounded-full bg-foreground/10 text-[10px] font-semibold text-foreground px-1">
                                            {newEmails}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-muted-foreground truncate block">{dossier.domaine || "—"}</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </SidebarMenuButton>

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
                                <DropdownMenuItem onClick={() => handleRenameStart(dossier.id, dossier.nom_client)}>
                                  <Pencil className="h-3.5 w-3.5 mr-2" /> Renommer
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger><Tag className="h-3.5 w-3.5 mr-2" /> Changer le domaine</DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="w-48">
                                    {DOMAINES.map((dom) => (
                                      <DropdownMenuItem key={dom} onClick={() => handleChangeDomaine(dossier.id, dom)} className={cn(dossier.domaine === dom && "font-medium text-primary")}>
                                        {dom}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger><ArrowRightLeft className="h-3.5 w-3.5 mr-2" /> Fusionner avec…</DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="w-48">
                                    {localDossiers.filter((d) => d.id !== dossier.id).map((d) => (
                                      <DropdownMenuItem key={d.id} onClick={() => handleMerge(dossier.id, d.id)}>{d.nom_client}</DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget({ id: dossier.id, name: dossier.nom_client })}>
                                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Supprimer
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

              {!collapsed && unclassifiedCount > 0 && (
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
            <button
              onClick={async () => {
                try {
                  const res = await apiPublicGet<{ auth_url: string }>("/api/import/gmail/auth");
                  if (res?.auth_url) window.location.href = res.auth_url;
                } catch { toast.error("Erreur lors de la connexion Gmail"); }
              }}
              className="text-xs text-primary hover:underline font-sans text-left"
            >
              Connecter Gmail pour de vrais dossiers →
            </button>
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

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg">Voulez-vous vraiment vous déconnecter ?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-muted-foreground">
              Vous devrez vous reconnecter pour accéder à votre espace Donna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-center gap-3 sm:justify-center">
            <AlertDialogCancel className="mt-0 border-muted-foreground/30 hover:bg-muted">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
