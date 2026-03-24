import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Zap, PenLine, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/PageTransition";
import { apiPublicGet } from "@/lib/api";
import heroBg from "@/assets/hero-bg.jpg";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" className="shrink-0">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 21 21" className="shrink-0">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

const Login = () => {
  const [gmailLoading, setGmailLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const emailRef = useRef<HTMLInputElement>(null);

  // Redirect if already logged in via localStorage or demo mode
  useEffect(() => {
    const userId = localStorage.getItem("donna_user_id");
    const isDemo = localStorage.getItem("donna_demo_mode") === "true";
    if (userId || isDemo) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleStartDemo = () => {
    localStorage.setItem("donna_demo_mode", "true");
    navigate("/onboarding?demo=true");
  };

  useEffect(() => {
    if (showFallback) emailRef.current?.focus();
  }, [showFallback]);

  const handleConnectGmail = async () => {
    setGmailLoading(true);
    try {
      const data = await apiPublicGet<{ auth_url: string }>("/api/import/gmail/auth");
      if (data?.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (error) {
      console.error("Error getting auth URL:", error);
      toast.error("Impossible de se connecter à Gmail. Réessayez.");
      setGmailLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success("Connexion réussie.");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Identifiants incorrects.");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: Mail, text: "Emails triés automatiquement à mesure qu'ils arrivent" },
    { icon: Zap, text: "Résumés intelligents, prêts à lire" },
    { icon: PenLine, text: "Brouillons de réponse en un clic" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left panel — testimonial + benefits */}
        <div
          className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 xl:p-16"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/70" />

          <div className="relative z-10">
            <Link to="/">
              <h2 className="text-2xl font-serif font-bold tracking-tight text-white">Donna</h2>
            </Link>
          </div>

          <div className="relative z-10 space-y-10">
            <div>
              <p className="text-white/90 text-xl sm:text-2xl font-serif font-semibold leading-snug max-w-md">
                « Donna a analysé 500 emails en 5 minutes. Je gagne 2h par jour. »
              </p>
              <p className="text-white/50 text-sm font-sans mt-3">
                — Avocate, droit des affaires
              </p>
            </div>

            <div className="h-px bg-white/15" />

            <div className="space-y-5">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <b.icon className="h-4 w-4 text-white/80" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm text-white/70 font-sans leading-relaxed mt-1">{b.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-xs text-white/30 font-sans">© 2026 Donna-Legal.ai</p>
          </div>
        </div>

        {/* Right panel — OAuth buttons */}
        <div className="flex-1 flex flex-col bg-background">
          <nav className="lg:hidden flex items-center justify-between px-6 py-6">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-sans">Retour</span>
            </Link>
            <Link to="/">
              <h2 className="text-xl font-serif font-bold tracking-tight text-foreground">Donna</h2>
            </Link>
          </nav>

          <div className="hidden lg:flex items-center px-6 pt-6">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-sans">Retour à l'accueil</span>
            </Link>
          </div>

          <main className="flex-1 flex items-center justify-center px-6 pb-16 lg:pb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-sm space-y-8"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
                  Commencez avec Donna
                </h1>
                <p className="text-sm font-sans text-muted-foreground">
                  Connectez votre boîte mail pour que Donna commence à travailler.
                </p>
              </div>

              {/* Gmail button */}
              <button
                onClick={handleConnectGmail}
                disabled={gmailLoading}
                className="w-full min-h-[56px] rounded-xl border border-border bg-background text-foreground font-medium text-sm font-sans flex items-center justify-center gap-3 hover:border-primary transition-colors disabled:opacity-60"
              >
                {gmailLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                Commencer avec Gmail →
              </button>

              {/* Outlook button */}
              <div className="space-y-1.5">
                <button
                  disabled
                  className="w-full min-h-[56px] rounded-xl border border-border bg-background text-foreground font-medium text-sm font-sans flex items-center justify-center gap-3 opacity-50 cursor-not-allowed"
                >
                  <MicrosoftIcon />
                  Commencer avec Outlook
                </button>
                <p className="text-xs text-muted-foreground text-center italic font-sans">Bientôt disponible</p>
              </div>

              {/* Demo button */}
              <button
                onClick={handleStartDemo}
                className="w-full min-h-[56px] rounded-xl border border-primary/30 bg-primary/5 text-primary font-medium text-sm font-sans flex items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-colors"
              >
                Essayer la démo →
              </button>


              {/* Separator + fallback login */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground font-sans">ou</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {!showFallback ? (
                  <button
                    onClick={() => setShowFallback(true)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
                  >
                    Se connecter avec email/mot de passe
                  </button>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleEmailLogin}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-sans">Email</Label>
                      <Input
                        id="email"
                        ref={emailRef}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="avocat@cabinet.fr"
                        className="font-sans h-11"
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs font-sans">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="font-sans pr-10 h-11"
                          autoComplete="current-password"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-11">
                      {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Se connecter
                    </Button>
                  </motion.form>
                )}
              </div>

              {/* Footer */}
              <div className="text-center space-y-2 pt-4">
                <p className="text-[11px] text-muted-foreground/60 font-sans">
                  Connexion OAuth sécurisée · Données hébergées en France
                </p>
                <Link to="/mentions-legales" className="text-[11px] text-muted-foreground/60 hover:text-foreground underline transition-colors font-sans">
                  Politique de confidentialité
                </Link>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
