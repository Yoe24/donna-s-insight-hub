import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, Shield, Clock, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/PageTransition";
import heroBg from "@/assets/hero-bg.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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
    {
      icon: Clock,
      text: "2 à 3 heures économisées chaque jour sur le traitement de vos emails",
    },
    {
      icon: Shield,
      text: "Données chiffrées, hébergées en France, conformes RGPD",
    },
    {
      icon: Lock,
      text: "Vos emails ne sont jamais utilisés pour entraîner des modèles IA",
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left panel — benefits */}
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
                « Donna lit mes mails, rédige mes réponses. Je valide en un clic. »
              </p>
              <p className="text-white/50 text-sm font-sans mt-3">
                — Avocate, droit des affaires
              </p>
            </div>

            <div className="h-px bg-white/15" />

            <div className="space-y-5">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <b.icon className="h-4 w-4 text-white/70 mt-0.5 shrink-0" strokeWidth={1.5} />
                  <p className="text-sm text-white/70 font-sans leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-xs text-white/30 font-sans">© 2026 Donna-Legal.ai</p>
          </div>
        </div>

        {/* Right panel — login form */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Mobile nav */}
          <nav className="lg:hidden flex items-center justify-between px-6 py-6">
            <Link to="/">
              <h2 className="text-xl font-serif font-bold tracking-tight text-foreground">Donna</h2>
            </Link>
          </nav>

          <main className="flex-1 flex items-center justify-center px-6 pb-16 lg:pb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-sm"
            >
              <div className="mb-10">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
                  Connexion
                </h1>
                <p className="text-sm font-sans text-muted-foreground">
                  Accédez à votre tableau de bord Donna.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-sans font-medium text-foreground">
                    Adresse email
                  </Label>
                  <Input
                    ref={emailRef}
                    id="email"
                    type="email"
                    placeholder="avocat@cabinet.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="font-sans h-11"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-sans font-medium text-foreground">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="font-sans pr-10 h-11"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-foreground text-background h-11 rounded-md text-sm font-sans font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-50 min-h-[48px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 space-y-2">
                <p className="text-xs text-muted-foreground font-sans">
                  Pas encore de compte ?{" "}
                  <Link to="/contact" className="text-foreground font-medium hover:underline">
                    Nous contacter
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground font-sans">
                  <Link to="/contact" className="hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </p>
              </div>

              <p className="mt-10 text-[11px] text-muted-foreground/60 font-sans text-center">
                Connexion sécurisée · Données hébergées en France
              </p>
            </motion.div>
          </main>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
