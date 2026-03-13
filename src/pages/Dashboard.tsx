import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Coffee, Eye, User, Copy, ChevronDown, Archive, Check, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useEmails, useEmailStats, useUpdateEmailStatus } from "@/hooks/useEmails";
import type { Email } from "@/hooks/useEmails";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { parseDonnaAnalysis } from "@/lib/parseDonnaAnalysis";
import { api } from "@/lib/api";

function formatEmailTime(created_at: string) {
  try {
    const date = new Date(created_at);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return `Aujourd'hui à ${format(date, "HH'h'mm", { locale: fr })}`;
    }
    return format(date, "d MMM 'à' HH'h'mm", { locale: fr });
  } catch {
    return "";
  }
}

function CategorieBadge({ email }: { email: Email }) {
  const categorie = email.metadata?.filtre?.categorie;
  if (categorie === "client") {
    return <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 font-medium">Client</span>;
  }
  if (categorie === "prospect") {
    return <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-[10px] px-2 py-0.5 font-medium">Prospect</span>;
  }
  return null;
}

function ImportArchives({ emails }: { emails: Email[] }) {
  const senderCounts: Record<string, number> = {};
  emails.forEach(e => {
    senderCounts[e.expediteur] = (senderCounts[e.expediteur] || 0) + 1;
  });
  const sortedSenders = Object.entries(senderCounts).sort((a, b) => b[1] - a[1]);
  const uniqueDossiers = new Set(emails.map(e => e.metadata?.filtre?.categorie)).size;

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group">
          <Archive className="h-3.5 w-3.5" />
          <span>Voir les archives d'import</span>
          <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-3 border-border bg-card">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-foreground">
              <span className="font-medium">{emails.length} emails importés</span>, répartis sur{" "}
              <span className="font-medium">{uniqueDossiers} catégories</span>
            </p>
            <div className="space-y-1.5">
              {sortedSenders.slice(0, 10).map(([sender, count]) => (
                <div key={sender} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate mr-4">{sender}</span>
                  <span className="text-foreground font-medium tabular-nums">{count} email{count > 1 ? "s" : ""}</span>
                </div>
              ))}
              {sortedSenders.length > 10 && (
                <p className="text-xs text-muted-foreground">… et {sortedSenders.length - 10} autres expéditeurs</p>
              )}
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Highlight [À VÉRIFIER] in orange
function AttentionText({ text }: { text: string }) {
  const parts = text.split(/(\[À VÉRIFIER\])/gi);
  return (
    <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
      {parts.map((part, i) =>
        part.match(/\[À VÉRIFIER\]/i) ? (
          <span key={i} className="text-orange-600 font-semibold bg-orange-100 px-1 rounded">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

const Dashboard = () => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [nomAvocat, setNomAvocat] = useState<string>("");
  const { emails, loading } = useEmails();
  const { stats } = useEmailStats();
  const { updateStatus } = useUpdateEmailStatus();

  useEffect(() => {
    api.get<{ nom_avocat?: string }>("/api/config")
      .then(data => {
        if (data?.nom_avocat) setNomAvocat(data.nom_avocat);
      })
      .catch(() => {});
  }, []);

  const activeEmails = emails.filter(e => e.statut !== "archive" && e.statut !== "ignore" && e.pipeline_step !== "importe");
  const isInboxEmpty = activeEmails.length === 0;

  const tempsMinutes = stats.traites * 5;
  const heures = Math.floor(tempsMinutes / 60);
  const minutes = tempsMinutes % 60;
  const tempsStr = heures > 0 ? `${heures}h${minutes.toString().padStart(2, "0")}min` : `${minutes}min`;

  const prenom = nomAvocat ? nomAvocat.split(" ")[0] : "";

  const handleFeedback = async (action: "parfait" | "modifier" | "erreur") => {
    if (!selectedEmail) return;
    try {
      await updateStatus(selectedEmail.id, action);
      setFeedbackGiven(action);
      toast.success("Feedback envoyé, merci !");
    } catch {
      toast.error("Erreur lors de l'envoi du feedback");
    }
  };

  const handleCopyResume = () => {
    if (!selectedEmail) return;
    const analysis = parseDonnaAnalysis(selectedEmail.brouillon);
    const text = [analysis.resume, analysis.recommandation].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("Résumé copié !");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Briefing line */}
        <div className="space-y-1">
          {prenom && (
            <p className="text-sm text-foreground">Bonjour {prenom},</p>
          )}
          <p className="text-sm text-muted-foreground">
            Donna a traité <span className="font-medium text-foreground">{stats.traites} emails</span>
            {" — "}
            <span className="font-medium text-foreground">{stats.en_attente}</span> nécessitent votre attention
            {" — "}
            Temps gagné : <span className="font-medium text-foreground">{tempsStr}</span>
          </p>
        </div>

        {/* Email list */}
        {isInboxEmpty ? (
          <div className="space-y-6">
            <div className="text-center py-16 space-y-4">
              <Coffee className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Tout est calme. Donna surveille votre boîte mail et vous préviendra dès qu'un email nécessite votre attention.
              </p>
            </div>
            {emails.length > 0 && <ImportArchives emails={emails} />}
          </div>
        ) : (
          <div className="space-y-3">
            {activeEmails.map((email, i) => {
              const isRejected = email.pipeline_step === "filtre_rejete";
              const analysis = parseDonnaAnalysis(email.brouillon);

              return (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className={`border-border bg-card transition-colors hover:bg-muted/30 cursor-pointer ${isRejected ? "opacity-40" : ""}`}
                    onClick={() => {
                      if (!isRejected) {
                        setSelectedEmail(email);
                        setFeedbackGiven(null);
                        setShowOriginal(false);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground truncate">{email.expediteur}</span>
                            <CategorieBadge email={email} />
                            {isRejected && (
                              <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-[10px] px-2 py-0.5">Ignoré</span>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto shrink-0">{formatEmailTime(email.created_at)}</span>
                          </div>
                          <p className="text-sm text-foreground/80 mt-1 truncate">{email.objet}</p>
                          {!isRejected && analysis.resume && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">{analysis.resume}</p>
                          )}
                        </div>
                        {!isRejected && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmail(email);
                              setFeedbackGiven(null);
                              setShowOriginal(false);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail slide-over */}
      <Sheet open={!!selectedEmail} onOpenChange={(open) => { if (!open) setSelectedEmail(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedEmail && (() => {
            const analysis = parseDonnaAnalysis(selectedEmail.brouillon);
            return (
              <>
                <SheetHeader className="pb-4 border-b border-border">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{selectedEmail.expediteur}</span>
                    <CategorieBadge email={selectedEmail} />
                    <span className="text-xs text-muted-foreground ml-auto">{formatEmailTime(selectedEmail.created_at)}</span>
                  </div>
                  <SheetTitle className="text-base font-semibold mt-1">{selectedEmail.objet}</SheetTitle>
                </SheetHeader>

                <div className="space-y-5 py-6">
                  {/* Résumé */}
                  {analysis.resume && (
                    <div className="rounded-lg bg-muted/60 border border-border p-4">
                      <p className="text-xs font-semibold text-foreground mb-2">📋 Résumé</p>
                      <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">{analysis.resume}</p>
                    </div>
                  )}

                  {/* Recommandation */}
                  {analysis.recommandation && (
                    <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                      <p className="text-xs font-semibold text-blue-700 mb-2">🎯 Recommandation</p>
                      <div className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                        {analysis.recommandation.split("\n").map((line, i) => (
                          <p key={i} className={line.startsWith("- ") ? "pl-3" : ""}>{line}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Points d'attention */}
                  {analysis.attention && (
                    <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                      <p className="text-xs font-semibold text-orange-600 mb-2">💡 Points d'attention</p>
                      <AttentionText text={analysis.attention} />
                    </div>
                  )}

                  {/* Fallback if no parsed sections */}
                  {!analysis.resume && !analysis.recommandation && !analysis.attention && selectedEmail.brouillon && (
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm whitespace-pre-wrap">{selectedEmail.brouillon}</p>
                    </div>
                  )}

                  {/* Email original */}
                  <Collapsible open={showOriginal} onOpenChange={setShowOriginal}>
                    <CollapsibleTrigger asChild>
                      <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronDown className={`h-3 w-3 transition-transform ${showOriginal ? "rotate-180" : ""}`} />
                        Voir l'email original
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-3 rounded-lg bg-muted/40 border border-border p-4">
                        <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">
                          {(selectedEmail as any).contenu || "Contenu non disponible."}
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Feedback */}
                  <div className="border-t border-border pt-5 space-y-3">
                    <p className="text-xs text-muted-foreground">Comment Donna a-t-elle travaillé sur cet email ?</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs ${feedbackGiven === "parfait" ? "border-green-500 bg-green-50 text-green-700" : "text-green-700 border-green-200 hover:bg-green-50"}`}
                        onClick={() => handleFeedback("parfait")}
                        disabled={!!feedbackGiven}
                      >
                        <Check className="h-3 w-3 mr-1" />Très bien analysé
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs ${feedbackGiven === "modifier" ? "border-amber-500 bg-amber-50 text-amber-700" : "text-amber-700 border-amber-200 hover:bg-amber-50"}`}
                        onClick={() => handleFeedback("modifier")}
                        disabled={!!feedbackGiven}
                      >
                        <Pencil className="h-3 w-3 mr-1" />À améliorer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs ${feedbackGiven === "erreur" ? "border-red-500 bg-red-50 text-red-700" : "text-red-700 border-red-200 hover:bg-red-50"}`}
                        onClick={() => handleFeedback("erreur")}
                        disabled={!!feedbackGiven}
                      >
                        <X className="h-3 w-3 mr-1" />Incorrecte
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs" onClick={handleCopyResume}>
                      <Copy className="h-3 w-3 mr-1" />Copier le résumé
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default Dashboard;
