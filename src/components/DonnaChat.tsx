/**
 * DonnaChat — Floating chat widget
 *
 * Always sends messages to /api/chat using the active user_id (demo or real).
 * The API handles demo responses server-side.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { apiPost } from "@/lib/api";
import { isDemo } from "@/lib/auth";
import { mockAllEmails, getEmailsForPeriod } from "@/lib/mock-briefing";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const WELCOME_MESSAGE = `Bonjour 👋 Je suis Donna, ton employée numérique.

Je travaille 24/7 sur ta boîte mail : je lis, je trie et je résume tous tes emails.

Tu peux me poser des questions ici :

- « Où en est le dossier Dupont ? »
- « Résume-moi les emails de cette semaine »
- « Qu'est-ce que je dois traiter en priorité ? »

Si tu viens d'arriver, commence par connecter ta boîte Gmail dans l'onglet **Configurez-moi** !`;

const STORAGE_KEY = "donna_chat_history";
const MAX_MESSAGES = 50;
const MAX_HISTORY = 20;

function getMockChatResponse(question: string): string {
  const q = question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // --- 1. Dossier-specific questions ---
  if (q.includes("dupont") || q.includes("btp")) {
    const emails = mockAllEmails.filter((e) => e.dossier_id === "1");
    const recent = emails.slice(0, 3);
    return `**Dossier Marie Dupont — Litige commercial**\n\nMme Dupont est en litige avec BTP Pro pour des travaux non conformes. Une mise en demeure a été envoyée le 2 mars.\n\n**Derniers emails (${emails.length} au total) :**\n${recent.map((e) => `- **${e.expediteur}** : ${e.objet}`).join("\n")}\n\n**Prochaine étape :** Si BTP Pro ne répond pas avant l'expiration du délai, engager une procédure judiciaire devant le Tribunal de commerce.`;
  }

  if (q.includes("martin") || q.includes("techcorp") || q.includes("rupture")) {
    const emails = mockAllEmails.filter((e) => e.dossier_id === "2");
    const recent = emails.slice(0, 3);
    return `**Dossier Jean-Pierre Martin — Droit du travail**\n\nM. Martin (7 ans d'ancienneté chez TechCorp SA) négocie une rupture conventionnelle. L'indemnité légale proposée (8 400 €) est jugée insuffisante.\n\n**Derniers emails (${emails.length} au total) :**\n${recent.map((e) => `- **${e.expediteur}** : ${e.objet}`).join("\n")}\n\n**Prochaines étapes :**\n- 2e entretien préalable dans quelques jours\n- Négocier l'indemnité supra-légale (objectif : 3 mois de salaire brut)\n- Demander la levée de la clause de non-concurrence`;
  }

  if (q.includes("roux") || q.includes("succession") || q.includes("immobilier")) {
    const emails = mockAllEmails.filter((e) => e.dossier_id === "4");
    return `**Dossier Famille Roux — Immobilier**\n\nExpertise judiciaire en cours sur un bien au 45 avenue des Lilas. L'expert Philippe Renard a révélé un affaissement de 4 cm des fondations.\n\n**${emails.length} emails au dossier.** Chiffrage réparations révisé à 92 500 € HT.\n\n**Prochaine étape :** Attendre le rapport définitif et préparer les conclusions.`;
  }

  if (q.includes("dubois") || q.includes("copropriete")) {
    const emails = mockAllEmails.filter((e) => e.dossier_id === "5");
    return `**Dossier Claire Dubois — Litige immobilier**\n\nLitige de copropriété. ${emails.length} emails au dossier.\n\n**Action en attente :** Relancer Mme Dubois pour les pièces manquantes (PV d'AG et relevés de charges 2024-2025) avant l'audience.`;
  }

  if (q.includes("bernard") || q.includes("divorce")) {
    const emails = mockAllEmails.filter((e) => e.dossier_id === "6");
    return `**Dossier Alice Bernard — Droit de la famille**\n\nProcédure de divorce en cours. La requête a été déposée auprès du tribunal. ${emails.length} emails au dossier.\n\n**Prochaine étape :** Attendre la convocation à l'audience de conciliation.`;
  }

  // Generic "dossier" question
  if (q.includes("dossier")) {
    return "J'ai 6 dossiers actifs en ce moment :\n\n1. **Marie Dupont** — Litige commercial (BTP Pro)\n2. **Jean-Pierre Martin** — Droit du travail (TechCorp)\n3. **Famille Roux** — Immobilier (expertise)\n4. **Claire Dubois** — Litige copropriété\n5. **Alice Bernard** — Droit de la famille\n6. **Notaire Me Blanchard** — Succession\n\nDemandez-moi des détails sur un dossier en particulier !";
  }

  // --- 2. Emails today / briefing ---
  if (q.includes("email") || q.includes("mail") || q.includes("briefing") || q.includes("aujourd") || q.includes("recu")) {
    const todayEmails = getEmailsForPeriod("24h");
    const clientEmails = todayEmails.filter((e) => e.dossier_id !== null);
    const filteredEmails = todayEmails.filter((e) => e.dossier_id === null);
    return `**Emails des dernières 24h : ${todayEmails.length} reçus**\n\n- **${clientEmails.length} liés à vos dossiers** :\n${clientEmails.slice(0, 5).map((e) => `  - ${e.expediteur} : *${e.objet}*`).join("\n")}\n- **${filteredEmails.length} filtrés** (newsletters, notifications)\n\nVoulez-vous que je détaille un email en particulier ?`;
  }

  // --- 3. Attachments / documents ---
  if (q.includes("piece") || q.includes("pj") || q.includes("document") || q.includes("jointe") || q.includes("fichier")) {
    const recentWithPj = mockAllEmails.filter((e) => e.pieces_jointes.length > 0).slice(0, 5);
    const totalPj = recentWithPj.reduce((acc, e) => acc + e.pieces_jointes.length, 0);
    return `**${totalPj} pièces jointes récentes :**\n\n${recentWithPj.flatMap((e) => e.pieces_jointes.map((pj) => `- **${pj.nom}** (${pj.taille}) — ${e.dossier_nom || "Non classé"}\n  _${pj.resume_ia.slice(0, 100)}${pj.resume_ia.length > 100 ? "…" : ""}_`)).join("\n")}\n\nCliquez sur une pièce jointe dans le briefing pour voir le résumé complet.`;
  }

  // --- 4. Deadlines / urgent ---
  if (q.includes("echeance") || q.includes("deadline") || q.includes("urgent") || q.includes("priorite") || q.includes("faire") || q.includes("traiter")) {
    return "**Actions prioritaires :**\n\n1. **Répondre à Jean-Pierre Martin** sur les points de l'entretien préalable — *2e entretien dans quelques jours*\n2. **Vérifier la mise en demeure** de BTP Pro — *délai expirant le 2 avril* (dossier Dupont)\n3. **Relancer Claire Dubois** pour les pièces manquantes — *audience prochaine*\n4. **Analyser le complément d'expertise** de Philippe Renard — *chiffrage révisé à 92 500 €* (dossier Roux)\n\n**Échéances à venir :**\n- 2 avril : expiration délai mise en demeure BTP Pro\n- Mi-avril : audience TGI (dossier Dubois)\n- Fin avril : dépôt conclusions (dossier Roux)";
  }

  // --- 5. Draft / response generation ---
  if (q.includes("brouillon") || q.includes("reponse") || q.includes("gener") || q.includes("redige")) {
    return "Je peux générer un brouillon de réponse pour n'importe quel email.\n\n**Comment faire :**\n1. Cliquez sur un email dans votre briefing ou dans un dossier\n2. Cliquez sur **« Générer une réponse »**\n3. Je rédige dans votre style avec votre signature\n4. Vous pouvez modifier le texte avant de l'envoyer\n\nEssayez avec le dernier email de Jean-Pierre Martin !";
  }

  // --- 6. Fallback ---
  return "Je peux vous aider sur vos dossiers, emails et échéances. Essayez par exemple :\n\n- « Où en est le dossier Martin ? »\n- « Quels emails aujourd'hui ? »\n- « Quelles sont mes pièces jointes récentes ? »\n- « Quelles sont mes urgences ? »\n- « Comment générer un brouillon ? »";
}

function loadMessages(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(-MAX_MESSAGES);
    }
  } catch {}
  return [{ role: "assistant", content: WELCOME_MESSAGE, timestamp: Date.now() }];
}

function saveMessages(messages: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-white text-sm font-semibold shrink-0">
        D
      </div>
      <div className="bg-[#F3F4F6] rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-5">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-[donna-bounce_1.4s_ease-in-out_infinite]" />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-[donna-bounce_1.4s_ease-in-out_0.2s_infinite]" />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-[donna-bounce_1.4s_ease-in-out_0.4s_infinite]" />
        </div>
      </div>
    </div>
  );
}

export default function DonnaChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFirstLoad = useRef(messages.length === 1 && messages[0].role === "assistant");

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen, messages, isLoading, scrollToBottom]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: text, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    if (isDemo()) {
      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
      const response = getMockChatResponse(text);
      setMessages(prev => [...prev, { role: "assistant", content: response, timestamp: Date.now() }]);
      setIsLoading(false);
      return;
    }

    try {
      const history = newMessages.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
      const res = await apiPost<{ response: string }>("/api/chat", { message: text, history });
      const assistantMsg: ChatMessage = { role: "assistant", content: res.response, timestamp: Date.now() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: "Désolée, je n'ai pas pu répondre. Réessaie dans un instant.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => { setIsOpen(o => !o); isFirstLoad.current = false; }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-foreground text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
        aria-label="Ouvrir le chat Donna"
      >
        <MessageCircle size={26} />
        {isFirstLoad.current && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 bottom-24 right-6 w-[400px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:rounded-none max-sm:bottom-0 max-sm:right-0"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <span className="text-base font-semibold text-gray-900">💬 Donna</span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "items-end gap-2"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      D
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-foreground text-background rounded-2xl rounded-tr-sm"
                        : "bg-[#F3F4F6] text-gray-900 rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:mt-1 [&_ul]:mb-1 [&_li]:m-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-3 pb-3 pt-1">
              <div className="flex items-end gap-2 bg-[#F3F4F6] rounded-xl px-3 py-2 focus-within:shadow-md transition-shadow">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => { setInput(e.target.value); autoResize(); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez une question à Donna..."
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-gray-900 placeholder:text-gray-400 max-h-[120px] leading-relaxed"
                />
                {input.trim() && (
                  <button
                    onClick={sendMessage}
                    disabled={isLoading}
                    className="w-8 h-8 rounded-full bg-foreground text-white flex items-center justify-center shrink-0 hover:bg-foreground/80 transition-colors disabled:opacity-50 cursor-pointer"
                    aria-label="Envoyer"
                  >
                    <ArrowUp size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes donna-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
