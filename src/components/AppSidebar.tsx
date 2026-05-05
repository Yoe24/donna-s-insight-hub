/**
 * AppSidebar — Main navigation sidebar
 *
 * Always fetches dossiers and brief data from API using the active user_id.
 * No hardcoded demo data — the API serves demo content for the demo user_id.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { LogOut, MoreHorizontal, Pencil, ArrowRightLeft, Trash2, Tag, RefreshCw, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDossiers } from "@/hooks/useDossiers";
import { logout as authLogout } from "@/lib/auth";
import { startImport, getProcessStatus } from "@/lib/api/v1-lab";
import { getUserId } from "@/lib/auth";
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
import { OnboardingWizard } from "@/components/lab/OnboardingWizard";
import { toast } from "sonner";

const DOMAINES = [
  "Droit du travail", "Droit de la famille", "Droit immobilier", "Droit commercial",
  "Droit des successions", "Droit pénal", "Bail commercial", "Gestion cabinet", "Autre",
];

function shortName(full: string): string {
  if (!full) return "Dossier";
  // Strip everything after " — " or " - " or " | "
  const stripped = full.split(/\s[—\-|]\s/)[0].trim();
  // Remove leading/trailing quotes
  return stripped.replace(/^["«»]|["«»]$/g, "").trim() || full;
}

function getInitials(name: string) {
  const short = shortName(name);
  if (!short) return "?";
  return short.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}

import { colorByIndex as sharedColorByIndex } from "@/lib/dossierColors";

function colorByIndex(index: number): { bg: string; text: string } {
  const c = sharedColorByIndex(index);
  return { bg: c.bgClass, text: c.textClass };
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut, user } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { dossiers: liveDossiers, loading } = useDossiers();
  const navigate = useNavigate();
  const location = useLocation();

  const [refreshing, setRefreshing] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    setWizardOpen(true);
    try {
      await startImport("gmail", { reset: false });
      const userId = getUserId();
      const processRes = await fetch(
        `https://api.donna-legal.com/api/v1/lab/process?user_id=${encodeURIComponent(userId)}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      const processData = await processRes.json();
      const jobId = processData?.job_id ?? null;
      if (!jobId) {
        // Pas de job — on laisse tout de même la cinématique se jouer ~30s
        return;
      }
      // Poll until done — la cinématique tourne en parallèle. Si elle finit
      // avant le job, on garde le wizard sur la dernière étape jusqu'au done.
      const interval = setInterval(async () => {
        try {
          const status = await getProcessStatus(jobId);
          if (status.status === "done") {
            clearInterval(interval);
          } else if (status.status === "error") {
            clearInterval(interval);
            setWizardOpen(false);
            setRefreshing(false);
            toast.error("Refresh échoué.");
          }
        } catch {
          /* keep polling */
        }
      }, 3000);
    } catch {
      setWizardOpen(false);
      setRefreshing(false);
      toast.error("Refresh échoué.");
    }
  }, [refreshing]);

  const handleWizardComplete = useCallback(() => {
    setWizardOpen(false);
    setRefreshing(false);
    toast.success("Calendrier mis à jour.");
    window.location.reload();
  }, []);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [localDossiers, setLocalDossiers] = useState<any[]>([]);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalDossiers(liveDossiers);
  }, [liveDossiers]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

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
      <OnboardingWizard open={wizardOpen} onComplete={handleWizardComplete} />
      <Sidebar collapsible="icon" className="border-r border-border">
        <div className="px-4 py-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold text-sidebar-foreground">
              {collapsed ? "D" : "Donna"}
            </h2>
          </Link>
          {!collapsed && user?.email && (
            <div className="mt-2 flex items-center gap-1.5">
              <p className="text-[11px] text-muted-foreground truncate flex-1" title={user.email}>
                {user.email}
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60 transition-colors disabled:opacity-50"
                title="Rafraîchir la boîte mail"
                aria-label="Rafraîchir"
              >
                {refreshing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </button>
            </div>
          )}
        </div>

        <SidebarContent>
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
                    localDossiers.map((dossier, dIdx) => {
                      const active = location.pathname === `/dossiers/${dossier.id}`;
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
                              "w-full rounded-md pl-2 pr-8 py-2.5 text-sm font-sans transition-colors cursor-pointer",
                              active
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                            )}
                          >
                            <div className="flex items-center gap-2.5 w-full min-w-0">
                              <div className="shrink-0">
                                {(() => {
                                  const color = colorByIndex(dIdx);
                                  return (
                                    <div className={cn(
                                      "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold",
                                      active ? "bg-primary text-primary-foreground" : `${color.bg} ${color.text}`
                                    )}>
                                      {getInitials(dossier.nom_client)}
                                    </div>
                                  );
                                })()}
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
                                    <span className="truncate text-sm font-medium leading-tight block">
                                      {shortName(dossier.nom_client)}
                                    </span>
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

            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 space-y-3">
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
