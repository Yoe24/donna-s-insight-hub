import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { api } from "@/lib/api";

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
      <div className="w-8 h-8 rounded-full bg-[#6C63FF] flex items-center justify-center text-white text-sm font-semibold shrink-0">
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

    try {
      const history = newMessages.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
      const res = await api.post<{ response: string }>("/api/chat", { message: text, history });
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
      {/* Floating button */}
      <button
        onClick={() => { setIsOpen(o => !o); isFirstLoad.current = false; }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#6C63FF] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
        aria-label="Ouvrir le chat Donna"
      >
        <MessageCircle size={26} />
        {isFirstLoad.current && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 bottom-24 right-6 w-[400px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:rounded-none max-sm:bottom-0 max-sm:right-0"
          >
            {/* Header */}
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "items-end gap-2"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-[#6C63FF] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      D
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#6C63FF] text-white rounded-2xl rounded-tr-sm"
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

            {/* Input */}
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
                    className="w-8 h-8 rounded-full bg-[#6C63FF] text-white flex items-center justify-center shrink-0 hover:bg-[#5a52e0] transition-colors disabled:opacity-50 cursor-pointer"
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

      {/* Bounce animation */}
      <style>{`
        @keyframes donna-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
