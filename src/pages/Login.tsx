import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pour le moment, connexion simple avec validation basique
    if (!email.trim() || !password.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    toast.success("Connexion réussie !");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 sm:py-6 max-w-7xl mx-auto w-full">
        <Link to="/">
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-foreground">Donna</h2>
        </Link>
      </nav>

      {/* Login form */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">
              Bienvenue
            </h1>
            <p className="text-sm font-sans text-muted-foreground">
              Connectez-vous pour accéder à votre tableau de bord.
            </p>
          </div>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="font-sans"
                    autoComplete="email"
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
                      placeholder="••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="font-sans pr-10"
                      autoComplete="current-password"
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

                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-medium mt-2"
                  size="lg"
                >
                  Se connecter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground font-sans mt-6">
            Pas encore de compte ?{" "}
            <span className="text-accent font-medium cursor-pointer hover:underline">
              Contactez votre avocat
            </span>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;
