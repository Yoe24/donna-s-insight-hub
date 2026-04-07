/**
 * BannerReconnectGmail
 *
 * Affiche une bannière rouge en haut du dashboard quand le refresh token
 * Gmail de l'utilisateur est mort (gmail_needs_reconnect = true côté backend).
 *
 * Le bouton relance le flow OAuth Gmail. Une fois l'utilisateur reconnecté,
 * le backend reset gmail_needs_reconnect = false dans /api/import/callback.
 */

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiGet, apiPublicGet } from "@/lib/api";

interface ConfigShape {
  gmail_connected?: boolean;
  gmail_needs_reconnect?: boolean;
}

export function BannerReconnectGmail() {
  const [needsReconnect, setNeedsReconnect] = useState(false);
  const [loadingClick, setLoadingClick] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      try {
        const cfg = await apiGet<ConfigShape>("/api/config");
        if (!cancelled && cfg && cfg.gmail_needs_reconnect === true) {
          setNeedsReconnect(true);
        }
      } catch {
        // silencieux : si /api/config échoue (user pas auth, etc.) on n'affiche rien
      }
    }
    loadConfig();
    // Re-check toutes les 60s (au cas où le polling serveur lève le flag pendant la session)
    const interval = setInterval(loadConfig, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function handleReconnect() {
    if (loadingClick) return;
    setLoadingClick(true);
    try {
      const data = await apiPublicGet<{ auth_url: string }>(
        "/api/import/gmail/auth"
      );
      if (data?.auth_url) {
        window.location.href = data.auth_url;
        return;
      }
      throw new Error("auth_url manquant");
    } catch {
      // En cas d'échec, on retombe en main : on reset le bouton et on alerte
      setLoadingClick(false);
      alert(
        "Impossible de relancer la reconnexion Gmail. Réessaye dans quelques secondes."
      );
    }
  }

  return (
    <AnimatePresence>
      {needsReconnect && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="overflow-hidden border-b border-red-200 bg-red-50"
          role="alert"
          aria-live="polite"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 flex-1">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <div className="text-sm leading-snug">
                <p className="font-sans font-semibold text-red-900">
                  Connexion à votre boîte mail interrompue
                </p>
                <p className="font-sans text-red-700 mt-0.5">
                  Donna ne traite plus vos nouveaux emails. Reconnectez votre
                  Gmail pour reprendre le service en 30 secondes.
                </p>
              </div>
            </div>
            <button
              onClick={handleReconnect}
              disabled={loadingClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-sans font-medium hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              {loadingClick ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirection...
                </>
              ) : (
                "Reconnecter Gmail"
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
