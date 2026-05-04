/**
 * DashboardWow — Briefing page with DemoWow visual design + live data
 *
 * Design: DemoWow palette + SlimTaskCard + EmailDrawer
 * Data: live from /api/briefs/today + /api/emails + /api/config
 * Layout: wrapped in DashboardLayout (sidebar + top nav)
 * Demo mode: falls back to v4Briefing mock data (same as DashboardV6)
 */

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Edit3, Eye, Check, Copy, FileText, Mail, ArrowLeft,
  ThumbsUp, Pencil, XCircle, CheckCircle2, X, Download,
  ChevronRight, Clock
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

import { DashboardLayout } from "@/components/DashboardLayout"
import { EmailDrawer } from "@/components/EmailDrawer"
import { isDemo, getUserId } from "@/lib/auth"
import { apiGet, apiPost } from "@/lib/api"
import { v4Briefing, type V4Email, type V4BriefingData, type V4Dossier } from "@/lib/mock-briefing-v4"
import type { Email } from "@/hooks/useEmails"

// ─── Palette DemoWow ───
const BG = "#FFFFFF"
const SIDEBAR_BG = "#F9FAFB"
const TEXT = "#0D0D0D"
const TEXT_MUTED = "#737373"
const TEXT_LIGHT = "#A0A0A0"
const ACCENT = "#0D0D0D"
const ACCENT_BG = "#F5F5F5"
const BORDER = "#E5E5E5"
const GREEN = "#10B981"
const URGENT = "#FF5555"

// ─── Types ───
type PeriodFilter = "24h" | "7j" | "30j"

// ─── Helpers ───
function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ""
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const hhmm = `${date.getHours()}h${String(date.getMinutes()).padStart(2, "0")}`
    if (diffHours < 1) return `${Math.max(1, Math.floor(diffMs / 60_000))} min`
    if (diffHours < 24 && date.getDate() === now.getDate()) return `Aujourd'hui, ${hhmm}`
    if (diffHours < 48) return `Hier, ${hhmm}`
    const jours = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."]
    if (diffHours < 168) return `${jours[date.getDay()]}, ${hhmm}`
    return format(date, "d MMM", { locale: fr })
  } catch {
    return ""
  }
}

function parseExpeditorName(raw: string): string {
  if (!raw) return ""
  const match = raw.match(/^([^<]+?)\s*</)
  if (match) return match[1].trim()
  return raw.trim()
}

function filterByPeriod(emails: any[], period: PeriodFilter): any[] {
  const now = Date.now()
  const cutoffs: Record<PeriodFilter, number> = {
    "24h": 24 * 3600 * 1000,
    "7j": 7 * 24 * 3600 * 1000,
    "30j": 30 * 24 * 3600 * 1000,
  }
  const cutoff = cutoffs[period]
  return emails.filter((e) => {
    const raw = e.created_at || e.date
    const ts = raw ? new Date(raw).getTime() : 0
    return now - ts <= cutoff
  })
}

function apiEmailToV4(e: any): V4Email {
  const objet = e.objet ?? e.subject ?? ""
  const resume = e.resume ?? e.summary ?? ""
  const expediteur = e.expediteur ?? (e.from_name ? `${e.from_name} <${e.from_email ?? ""}>` : e.from_email ?? "")
  const brouillon = e.brouillon ?? e.draft ?? null
  const createdAt = e.created_at ?? e.date ?? new Date().toISOString()
  const dossierNom = e.dossier_nom ?? e.dossier_name ?? null
  const urgencyRaw = e.urgency ?? e.classification?.urgency ?? "low"

  return {
    id: e.id,
    expediteur: parseExpeditorName(expediteur),
    email_from: expediteur,
    objet,
    resume,
    corps_original: e.metadata?.body ?? "",
    date: createdAt,
    dossier_id: e.dossier_id ?? null,
    dossier_nom: dossierNom,
    dossier_domaine: e.dossier_domaine ?? e.dossier_domain ?? null,
    urgency:
      urgencyRaw === "high" || urgencyRaw === "haute" ? "haute"
      : urgencyRaw === "medium" || urgencyRaw === "moyenne" ? "moyenne"
      : "basse",
    email_type: e.classification?.email_type ?? "informatif",
    pieces_jointes: (e.attachments ?? []).map((a: any) => ({
      nom: a.nom_fichier ?? a.nom ?? "document",
      taille: "",
      type_mime: a.type ?? "",
      resume_ia: a.resume_ia ?? "",
    })),
    brouillon_mock: brouillon,
  }
}

function buildNarrative(
  briefNarrative: string | null,
  filteredEmails: any[],
  period: PeriodFilter,
): string {
  if (briefNarrative && period === "24h") return briefNarrative
  const count = filteredEmails.length
  const actionCount = filteredEmails.filter((e) => e.pipeline_step === "pret_a_reviser").length
  const ignoredCount = filteredEmails.filter((e) => e.pipeline_step === "ignore").length
  if (count === 0) {
    if (period === "24h") return "Aujourd'hui, aucun email n'a été reçu. Votre boîte est à jour."
    if (period === "7j") return "Cette semaine, aucun email n'a été reçu."
    return "Ce mois, aucun email n'a été traité par Donna."
  }
  if (period === "7j") {
    return `Cette semaine, Donna a analysé ${count} email${count > 1 ? "s" : ""}. ${actionCount > 0 ? `${actionCount} requièrent votre attention.` : ""} ${ignoredCount > 0 ? `${ignoredCount} filtrés automatiquement.` : ""}`
  }
  if (period === "30j") {
    return `Ce mois, Donna a traité ${count} email${count > 1 ? "s" : ""}. ${actionCount > 0 ? `${actionCount} action${actionCount > 1 ? "s" : ""} en attente.` : "Tous les emails ont été traités."}`
  }
  return `Aujourd'hui, Donna a analysé ${count} email${count > 1 ? "s" : ""}. ${actionCount > 0 ? `${actionCount} requièrent votre attention.` : "Tout est traité."}`
}

function buildRealBriefing({
  nomAvocat,
  filteredEmails,
  allEmails,
  narrative,
  dossiers,
  period,
}: {
  nomAvocat: string
  filteredEmails: any[]
  allEmails: any[]
  narrative: string | null
  dossiers: V4Dossier[]
  period: PeriodFilter
}): V4BriefingData {
  const readyInPeriod = filteredEmails.filter((e) => e.pipeline_step === "pret_a_reviser")
  const readyEmails = readyInPeriod.length > 0
    ? readyInPeriod
    : allEmails.filter((e) => e.pipeline_step === "pret_a_reviser").slice(0, 15)

  const actionCandidates = readyEmails.filter(
    (e) => e.needs_response === true || e.urgency === "high" || e.urgency === "medium"
  )
  const toDoRaw = actionCandidates.length > 0 ? actionCandidates : readyEmails

  const urgencyOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const sorted = [...toDoRaw].sort((a, b) => (urgencyOrder[a.urgency] ?? 2) - (urgencyOrder[b.urgency] ?? 2))
  const perDossier = new Map<string, number>()
  const limitedToDo = sorted.filter((e) => {
    const key = e.dossier_id || "no-dossier"
    const count = perDossier.get(key) || 0
    if (count >= 2) return false
    perDossier.set(key, count + 1)
    return true
  })
  const toDoEmails: V4Email[] = limitedToDo.map(apiEmailToV4)

  const treatedEmails: V4Email[] = filteredEmails
    .filter((e) => e.pipeline_step === "ignore")
    .slice(0, 20)
    .map((e): V4Email => ({
      ...apiEmailToV4(e),
      urgency: "basse",
      email_type: "informatif",
      pieces_jointes: [],
      brouillon_mock: null,
      filtered_by_donna: true,
    }))

  return {
    nom_avocat: nomAvocat,
    date_briefing: new Date().toISOString(),
    narrative: buildNarrative(narrative, filteredEmails, period),
    emails_action: toDoEmails,
    emails_traites: treatedEmails,
    dossiers,
    stats: {
      total_analyses: allEmails.length,
      action_required: toDoEmails.length,
      auto_traites: treatedEmails.length,
      temps_gagne_minutes: Math.round(allEmails.length * 2.5),
      brouillons_generes: allEmails.filter((e) => e.brouillon).length,
      streak_jours: 0,
      brief_lu: true,
    },
  }
}

function v4EmailToDrawerEmail(e: V4Email): Email {
  return {
    id: e.id,
    expediteur: e.expediteur,
    objet: e.objet,
    resume: e.resume,
    brouillon: e.brouillon_mock,
    pipeline_step: "pret_a_reviser",
    contexte_choisi: e.dossier_nom || "",
    statut: "en_attente",
    created_at: e.date,
    updated_at: e.date,
    email_type: e.email_type,
    ...(e.pieces_jointes.length > 0
      ? { attachments: e.pieces_jointes.map((pj) => ({ ...pj, storage_url: null })) }
      : {}),
    ...(e.corps_original ? { contenu: e.corps_original } : {}),
    ...(e.dossier_id ? { dossier_id: e.dossier_id, dossier_nom: e.dossier_nom } : {}),
  } as any
}

// ═══════════════════════════════════════════════════════
// ─── SlimTaskCard — DemoWow style, adapted for live data
// ═══════════════════════════════════════════════════════
function SlimTaskCard({
  email,
  onView,
  onDraft,
  onTreat,
  treated,
  index,
}: {
  email: V4Email
  onView: () => void
  onDraft: () => void
  onTreat: () => void
  treated: boolean
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)

  if (treated) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.42 }}
        transition={{ duration: 0.3 }}
        style={{
          border: `1px solid ${BORDER}`, borderRadius: 16, padding: "14px 20px",
          marginBottom: 10, background: BG, display: "flex", alignItems: "center", gap: 10
        }}
      >
        <button
          onClick={onTreat}
          title="Marquer comme non traité"
          style={{
            width: 18, height: 18, borderRadius: "50%", border: `2px solid ${GREEN}`,
            background: GREEN, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0, padding: 0
          }}
        >
          <Check size={10} color="#fff" />
        </button>
        <span style={{ fontSize: 14, color: TEXT_MUTED, textDecoration: "line-through", flex: 1 }}>
          {email.objet}
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1], delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
        background: BG,
        boxShadow: hovered ? "0 4px 12px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ padding: "16px 20px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {/* Checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); onTreat() }}
            title="Mail envoyé"
            style={{
              width: 17, height: 17, borderRadius: "50%", border: `1.5px solid ${BORDER}`,
              background: "transparent", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 2, padding: 0,
              transition: "border-color 0.15s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = TEXT_MUTED)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
          />
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
            {email.dossier_nom && (
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>
                Dossier {email.dossier_nom}
              </div>
            )}
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, lineHeight: 1.35, marginBottom: 4 }}>
              {email.objet}
            </div>
            {email.resume && (
              <div style={{ fontSize: 12, color: TEXT_MUTED, lineHeight: 1.5 }}>
                {email.resume.length > 120 ? email.resume.slice(0, 117) + "…" : email.resume}
              </div>
            )}
            {/* Urgency badge */}
            {email.urgency === "haute" && (
              <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 700, color: URGENT, background: "rgba(255,85,85,0.1)", padding: "2px 7px", borderRadius: 4, letterSpacing: "0.05em" }}>
                URGENT
              </span>
            )}
          </div>
          <ChevronRight
            size={14}
            color={TEXT_LIGHT}
            style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0, marginTop: 4 }}
          />
        </div>

        {/* Action buttons row — always visible */}
        <div style={{ marginTop: 12, marginLeft: 27, display: "flex", gap: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onView() }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "7px 14px", borderRadius: 7, border: `1px solid ${BORDER}`,
              background: BG, color: TEXT_MUTED, fontSize: 12, cursor: "pointer",
              fontFamily: "inherit", fontWeight: 500, transition: "all 0.15s"
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT; (e.currentTarget as HTMLButtonElement).style.color = ACCENT }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.color = TEXT_MUTED }}
          >
            <Eye size={12} /> Voir
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDraft() }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "7px 16px", borderRadius: 7, border: "none",
              background: "#0D0D0D", color: "#FFFFFF", fontSize: 12, cursor: "pointer",
              fontFamily: "inherit", fontWeight: 500, transition: "opacity 0.2s"
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1" }}
          >
            <Edit3 size={12} /> Brouillon
          </button>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "14px 20px 18px 20px", borderTop: `1px solid ${BORDER}` }}>
              {/* Email metadata */}
              <div style={{ background: SIDEBAR_BG, borderRadius: 8, padding: "12px 14px", marginBottom: 14, fontSize: 12, lineHeight: 1.8, border: `1px solid ${BORDER}` }}>
                <div><span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 40 }}>De</span> <span style={{ fontWeight: 600, color: TEXT }}>{email.email_from || email.expediteur}</span></div>
                <div><span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 40 }}>Date</span> <span style={{ color: TEXT }}>{formatRelativeDate(email.date)}</span></div>
                {email.dossier_nom && <div><span style={{ color: TEXT_LIGHT, display: "inline-block", minWidth: 40 }}>Dossier</span> <span style={{ color: TEXT }}>{email.dossier_nom}</span></div>}
              </div>
              {/* Donna summary */}
              {email.resume && (
                <div style={{ background: ACCENT_BG, borderRadius: 8, padding: "12px 14px", marginBottom: 14, border: `1px solid rgba(37,99,235,0.12)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>D</div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT }}>Résumé Donna</span>
                  </div>
                  <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.65, margin: 0 }}>{email.resume}</p>
                </div>
              )}
              {/* PJ pills */}
              {email.pieces_jointes.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Pièces jointes</div>
                  {email.pieces_jointes.map((pj) => (
                    <div key={pj.nom} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 7, border: `1px solid ${BORDER}`, background: BG, marginBottom: 5 }}>
                      <FileText size={14} color={ACCENT} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: TEXT, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pj.nom}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Full reply button */}
              <button
                onClick={(e) => { e.stopPropagation(); onDraft() }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  width: "100%", padding: "10px 24px", borderRadius: 8,
                  background: "#0D0D0D", color: "#FFFFFF", border: "none",
                  fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s"
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85" }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1" }}
              >
                <Edit3 size={14} /> Générer une réponse
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Period tabs ───
function PeriodTabs({ period, onChange }: { period: PeriodFilter; onChange: (p: PeriodFilter) => void }) {
  const tabs: PeriodFilter[] = ["24h", "7j", "30j"]
  return (
    <div style={{ display: "inline-flex", gap: 4 }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            padding: "5px 13px", borderRadius: 999,
            border: `1px solid ${period === tab ? ACCENT : BORDER}`,
            background: period === tab ? ACCENT : BG,
            color: period === tab ? "#fff" : TEXT_MUTED,
            fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            fontWeight: 500, transition: "all 0.15s"
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

// ─── Skeleton ───
function SkeletonBlock({ h, w = "100%" }: { h: number; w?: string }) {
  return (
    <div style={{
      height: h, width: w, borderRadius: 12, marginBottom: 12,
      background: "#F3F4F6",
      animation: "pulse 1.5s ease-in-out infinite"
    }} />
  )
}

// ─── All done banner ───
function AllDoneBanner({ nomAvocat }: { nomAvocat?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ borderRadius: 16, border: `1px solid ${BORDER}`, background: SIDEBAR_BG, padding: 32, textAlign: "center" }}
    >
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: `2px solid ${GREEN}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
        <Check size={20} color={GREEN} />
      </div>
      <p style={{ fontWeight: 600, color: TEXT, fontSize: 15, marginBottom: 4 }}>Tout est traité</p>
      <p style={{ fontSize: 13, color: TEXT_MUTED }}>
        {nomAvocat ? `Excellente session, ${nomAvocat}.` : "Excellente session."}
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// ─── Main Page
// ═══════════════════════════════════════════════════════
export default function DashboardWow() {
  const navigate = useNavigate()
  const [briefing, setBriefing] = useState<V4BriefingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodFilter>("24h")
  const [treatedIds, setTreatedIds] = useState<Set<string>>(new Set())
  const [nomAvocat, setNomAvocat] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "draft">("view")

  // Raw API data for re-filtering by period
  const [allApiEmails, setAllApiEmails] = useState<any[]>([])
  const [briefNarrative, setBriefNarrative] = useState<string | null>(null)
  const [briefDossiers, setBriefDossiers] = useState<V4Dossier[]>([])

  // Initial load
  useEffect(() => {
    const load = async () => {
      if (isDemo()) {
        await new Promise((r) => setTimeout(r, 300))
        setBriefing(v4Briefing)
        setNomAvocat(v4Briefing.nom_avocat)
        setLoading(false)
        return
      }

      try {
        const [briefResult, emailsResult, configResult] = await Promise.allSettled([
          apiGet<any>("/api/briefs/today"),
          apiGet<any[]>("/api/emails"),
          apiGet<{ nom_avocat?: string; user_email?: string }>("/api/config"),
        ])

        if (configResult.status === "fulfilled") {
          if (configResult.value?.nom_avocat) setNomAvocat(configResult.value.nom_avocat)
          if (configResult.value?.user_email) setUserEmail(configResult.value.user_email)
        }

        const apiEmails: any[] = emailsResult.status === "fulfilled"
          ? (emailsResult.value ?? []) : []
        setAllApiEmails(apiEmails)

        // Restore already-treated emails
        const alreadyTreated = apiEmails.filter((e) => e.statut === "traite" || e.statut === "valide").map((e) => e.id)
        if (alreadyTreated.length > 0) setTreatedIds(new Set(alreadyTreated))

        const briefContent = briefResult.status === "fulfilled" ? briefResult.value?.content : null
        setBriefNarrative(briefContent?.executive_summary ?? null)

        const dossiers: V4Dossier[] = (briefContent?.dossiers ?? []).map((d: any) => ({
          id: d.dossier_id ?? d.id ?? "",
          nom: d.nom ?? d.name ?? "",
          domaine: d.domaine ?? "",
          urgency: d.urgency === "high" || d.urgency === "haute" ? "haute"
            : d.urgency === "medium" || d.urgency === "moyenne" ? "moyenne"
            : "basse",
          email_ids: [],
          resume_court: d.summary ?? d.resume_court ?? "",
          dates_cles: d.dates_cles ?? [],
        }))
        setBriefDossiers(dossiers)

        if (emailsResult.status === "fulfilled" && apiEmails.length === 0) {
          navigate("/onboarding?import=started&user_id=" + getUserId())
          return
        }

        const filtered24h = filterByPeriod(apiEmails, "24h")
        const activeDossierIds = new Set(filtered24h.filter((e) => e.dossier_id).map((e) => e.dossier_id))
        const activeDossiers = dossiers.filter((d) => activeDossierIds.has(d.id))
        const realBriefing = buildRealBriefing({
          nomAvocat: configResult.status === "fulfilled" ? (configResult.value?.nom_avocat ?? "") : "",
          filteredEmails: filtered24h,
          allEmails: apiEmails,
          narrative: briefContent?.executive_summary ?? null,
          dossiers: activeDossiers,
          period: "24h",
        })
        setBriefing(realBriefing)
      } catch (err) {
        console.error("DashboardWow load error:", err)
        setBriefing({
          nom_avocat: nomAvocat || "",
          date_briefing: new Date().toISOString(),
          narrative: "Aucun dossier actif trouvé. Connectez votre boîte mail pour commencer.",
          emails_action: [],
          emails_traites: [],
          dossiers: [],
          stats: { total_analyses: 0, action_required: 0, auto_traites: 0, temps_gagne_minutes: 0, streak_jours: 0, brouillons_generes: 0, brief_lu: false },
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-filter on period change (real mode only)
  useEffect(() => {
    if (isDemo() || allApiEmails.length === 0) return
    const filtered = filterByPeriod(allApiEmails, period)
    const activeDossierIds = new Set(filtered.filter((e) => e.dossier_id).map((e) => e.dossier_id))
    const activeDossiers = briefDossiers.filter((d) => activeDossierIds.has(d.id))
    const updated = buildRealBriefing({
      nomAvocat,
      filteredEmails: filtered,
      allEmails: allApiEmails,
      narrative: briefNarrative,
      dossiers: activeDossiers,
      period,
    })
    setBriefing(updated)
  }, [period]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTreat = (id: string) => {
    setTreatedIds((prev) => { const next = new Set(prev); next.add(id); return next })
    if (!isDemo()) {
      apiPost(`/api/emails/${id}/status`, { statut: "traite" }).catch(() => {})
    }
    toast.success("Mail envoyé ✓", { duration: 1800 })
  }

  const handleView = (email: V4Email) => {
    setDrawerMode("view")
    setSelectedEmail(v4EmailToDrawerEmail(email))
  }

  const handleDraft = (email: V4Email) => {
    setDrawerMode("draft")
    setSelectedEmail(v4EmailToDrawerEmail(email))
  }

  const actionEmails = briefing?.emails_action ?? []
  const actionsValidees = actionEmails.filter((e) => treatedIds.has(e.id)).length
  const actionsCreees = actionEmails.length
  const allActionTreated = actionsCreees > 0 && actionsCreees === actionsValidees

  const dateLabel = format(new Date(), "EEEE d MMMM", { locale: fr })
  const dateLabelCap = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)
  const firstName = nomAvocat ? nomAvocat.split(" ")[0] : ""

  // ── Loading ──
  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 0" }}>
          <SkeletonBlock h={40} w="60%" />
          <SkeletonBlock h={16} w="40%" />
          <SkeletonBlock h={80} />
          <SkeletonBlock h={120} />
          <SkeletonBlock h={120} />
          <SkeletonBlock h={120} />
        </div>
      </DashboardLayout>
    )
  }

  if (!briefing) return null

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: 80 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: 24 }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 600, color: TEXT, margin: 0, lineHeight: 1.2 }}>
            Bonjour{firstName ? `, ${firstName}` : ""}
          </h1>
          <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
            {dateLabelCap}
            {userEmail && <> · <span style={{ color: TEXT_LIGHT }}>{userEmail}</span></>}
          </p>
        </motion.div>

        {/* ── Stats bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
        >
          {([
            { label: `${briefing.stats.total_analyses} analysés`, icon: Mail },
            { label: `${briefing.stats.auto_traites} filtrés`, icon: Check },
            { label: `${actionsCreees} à traiter`, icon: Edit3 },
            actionsValidees > 0 ? { label: `${actionsValidees} traités`, icon: CheckCircle2 } : null,
          ] as ({ label: string; icon: React.ElementType } | null)[]).filter((s): s is { label: string; icon: React.ElementType } => s !== null).map((stat, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 999, border: `1px solid ${BORDER}`, background: BG, fontSize: 12, color: TEXT_MUTED }}>
              <stat.icon size={11} color={TEXT_LIGHT} />
              {stat.label}
            </div>
          ))}
        </motion.div>

        {/* ── Donna narrative ── */}
        {briefing.narrative && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            style={{ background: ACCENT_BG, borderRadius: 12, padding: "16px 18px", marginBottom: 24, border: `1px solid rgba(37,99,235,0.10)` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>D</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT }}>Donna</span>
            </div>
            <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.7, margin: 0 }}>{briefing.narrative}</p>
          </motion.div>
        )}

        {/* ── Period tabs + To-do header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              À FAIRE
              {actionsCreees > 0 && (
                <span style={{ marginLeft: 8, fontWeight: 600, color: TEXT_MUTED }}>
                  {actionsValidees}/{actionsCreees}
                </span>
              )}
            </div>
          </div>
          <PeriodTabs period={period} onChange={setPeriod} />
        </div>

        {/* ── Task list ── */}
        <AnimatePresence mode="wait">
          {allActionTreated ? (
            <AllDoneBanner key="done" nomAvocat={nomAvocat} />
          ) : actionsCreees === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ padding: 32, textAlign: "center", color: TEXT_MUTED, fontSize: 14 }}
            >
              Aucun email à traiter sur cette période.
            </motion.div>
          ) : (
            <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {actionEmails.map((email, i) => (
                <SlimTaskCard
                  key={email.id}
                  email={email}
                  onView={() => handleView(email)}
                  onDraft={() => handleDraft(email)}
                  onTreat={() => handleTreat(email.id)}
                  treated={treatedIds.has(email.id)}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Dossiers actifs ── */}
        {briefing.dossiers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ marginTop: 32 }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
              DOSSIERS ACTIFS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {briefing.dossiers.map((dossier) => (
                <button
                  key={dossier.id}
                  onClick={() => navigate(`/dossiers/${dossier.id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px", borderRadius: 12, border: `1px solid ${BORDER}`,
                    background: BG, textAlign: "left", cursor: "pointer",
                    fontFamily: "inherit", transition: "background 0.15s, box-shadow 0.15s"
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = SIDEBAR_BG; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)" }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = BG; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{dossier.nom}</div>
                    <div style={{ fontSize: 11, color: TEXT_MUTED }}>{dossier.domaine}</div>
                    {dossier.resume_court && (
                      <div style={{ fontSize: 12, color: TEXT_LIGHT, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {dossier.resume_court}
                      </div>
                    )}
                  </div>
                  {dossier.urgency === "haute" && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: URGENT, background: "rgba(255,85,85,0.1)", padding: "2px 7px", borderRadius: 4, flexShrink: 0 }}>URGENT</span>
                  )}
                  <ChevronRight size={14} color={TEXT_LIGHT} />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Filtered by Donna ── */}
        {briefing.emails_traites.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ marginTop: 32 }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_LIGHT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              FILTRÉ PAR DONNA ({briefing.emails_traites.length})
            </div>
            <div style={{ borderRadius: 12, border: `1px solid ${BORDER}`, background: SIDEBAR_BG, overflow: "hidden" }}>
              {briefing.emails_traites.slice(0, 5).map((email, i) => (
                <div key={email.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                  borderBottom: i < Math.min(briefing.emails_traites.length, 5) - 1 ? `1px solid ${BORDER}` : "none"
                }}>
                  <Check size={12} color={TEXT_LIGHT} />
                  <span style={{ fontSize: 12, color: TEXT_MUTED, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {email.expediteur} — {email.objet}
                  </span>
                  <span style={{ fontSize: 11, color: TEXT_LIGHT, flexShrink: 0 }}>{formatRelativeDate(email.date)}</span>
                </div>
              ))}
              {briefing.emails_traites.length > 5 && (
                <div style={{ padding: "8px 16px", textAlign: "center", fontSize: 12, color: TEXT_LIGHT }}>
                  + {briefing.emails_traites.length - 5} autres filtrés
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Email Drawer ── */}
      <AnimatePresence>
        {selectedEmail && (
          <EmailDrawer
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
            showDossierLink={true}
            context="briefing"
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
