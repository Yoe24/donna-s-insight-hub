import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// MODE DEV: Hardcode temporaire pour tests
const DEV_CREDENTIALS = {
  email: 'test@donna-legale.ai',
  password: 'Test1234!'
};

const Login = () => {
  const [email, setEmail] = useState(DEV_CREDENTIALS.email);
  const [password, setPassword] = useState(DEV_CREDENTIALS.password);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full">
        <Link to="/">
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">Donna</h2>
        </Link>
      </nav>

      {/* Login form */}
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
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
              className="w-full bg-foreground text-background h-11 rounded-md text-sm font-sans font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                "Connexion..."
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
              <Link to="/demo" className="text-foreground font-medium hover:underline">
                Demander une démo
              </Link>
            </p>
            <p className="text-xs text-muted-foreground font-sans">
              🔧 Mode développement - Auth Supabase activée
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
