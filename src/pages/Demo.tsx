import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

const Demo = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nom: "", email: "", cabinet: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.email.trim()) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }
    setSent(true);
    toast.success("Demande envoyée !");
  };

  return (
    <div className="min-h-screen bg-foreground text-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full">
        <Link to="/">
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">Donna</h2>
        </Link>
        <div className="flex items-center gap-6 text-sm font-sans text-background/60">
          <Link to="/produit" className="hidden sm:inline hover:text-background transition-colors">Solution</Link>
          <Link to="/login" className="hover:text-background transition-colors">Se connecter</Link>
        </div>
      </nav>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {!sent ? (
            <>
              <div className="mb-10">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
                  Demander une démo
                </h1>
                <p className="text-sm font-sans text-background/60">
                  Laissez-nous vos coordonnées, nous vous recontactons sous 24h.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-sm font-sans font-medium text-background/80">
                    Nom complet *
                  </Label>
                  <Input
                    id="nom"
                    placeholder="Maître Dupont"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="font-sans h-11 bg-background/10 border-background/20 text-background placeholder:text-background/30 focus-visible:ring-background/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demo-email" className="text-sm font-sans font-medium text-background/80">
                    Email professionnel *
                  </Label>
                  <Input
                    id="demo-email"
                    type="email"
                    placeholder="avocat@cabinet.fr"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="font-sans h-11 bg-background/10 border-background/20 text-background placeholder:text-background/30 focus-visible:ring-background/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cabinet" className="text-sm font-sans font-medium text-background/80">
                    Nom du cabinet
                  </Label>
                  <Input
                    id="cabinet"
                    placeholder="Cabinet Dupont & Associés"
                    value={form.cabinet}
                    onChange={(e) => setForm({ ...form, cabinet: e.target.value })}
                    className="font-sans h-11 bg-background/10 border-background/20 text-background placeholder:text-background/30 focus-visible:ring-background/40"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-background text-foreground h-11 rounded-md text-sm font-sans font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
                >
                  Envoyer ma demande
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-14 h-14 rounded-full bg-background/10 flex items-center justify-center mx-auto mb-6">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-2">Demande envoyée</h2>
              <p className="text-sm font-sans text-background/60 mb-8">
                Nous vous recontactons très vite pour planifier votre démo.
              </p>
              <Link to="/">
                <button className="bg-background text-foreground px-8 py-3 rounded-full text-sm font-sans font-medium hover:opacity-90 transition-opacity">
                  Retour à l'accueil
                </button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Demo;
