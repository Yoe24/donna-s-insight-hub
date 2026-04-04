import { useState } from "react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageTransition } from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Shield, Lock } from "lucide-react";

const Contact = () => {
  const [form, setForm] = useState({ nom: "", email: "", cabinet: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.email) {
      toast({ title: "Veuillez remplir votre nom et email.", variant: "destructive" });
      return;
    }
    const submissions = JSON.parse(localStorage.getItem("donna_contact_requests") || "[]");
    submissions.push({ ...form, submittedAt: new Date().toISOString() });
    localStorage.setItem("donna_contact_requests", JSON.stringify(submissions));
    setSent(true);
    toast({ title: "Merci ! Nous vous recontactons sous 24h." });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNavbar />
        <section className="flex-1 max-w-2xl mx-auto px-6 pt-16 pb-20">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight mb-4">
            Demander un essai gratuit
          </h1>
          <p className="text-base font-sans text-muted-foreground leading-relaxed mb-8">
            Laissez-nous vos coordonnées et nous vous recontactons sous 24h pour configurer votre essai. 14 jours gratuits, sans engagement.
          </p>

          <div className="flex items-center gap-6 mb-8 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Données en France</span>
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Lecture seule</span>
          </div>

          {sent ? (
            <div className="text-center py-12 rounded-xl border border-border">
              <p className="text-lg font-sans font-semibold text-foreground mb-2">Merci !</p>
              <p className="text-muted-foreground text-sm">Nous vous recontactons sous 24h pour configurer votre essai.</p>
              <p className="text-muted-foreground text-xs mt-4">donna@donna-legal.com</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="nom" className="text-foreground text-sm">Nom complet</Label>
                <Input id="nom" required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="mt-1.5" placeholder="Me Alexandra Fernandez" />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground text-sm">Email professionnel</Label>
                <Input id="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1.5" placeholder="a.fernandez@cabinet-fernandez.fr" />
              </div>
              <div>
                <Label htmlFor="cabinet" className="text-foreground text-sm">Nom du cabinet (optionnel)</Label>
                <Input id="cabinet" value={form.cabinet} onChange={e => setForm({ ...form, cabinet: e.target.value })} className="mt-1.5" placeholder="Cabinet Fernandez" />
              </div>
              <div>
                <Label htmlFor="message" className="text-foreground text-sm">Message (optionnel)</Label>
                <textarea id="message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1.5"
                  rows={3} placeholder="J'aimerais tester Donna sur mon cabinet..." />
              </div>
              <button type="submit" className="w-full bg-foreground text-background py-3.5 rounded-lg text-sm font-sans font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2">
                Demander mon essai gratuit
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Pas de carte bancaire. Pas d'engagement. Réponse sous 24h.
              </p>
            </form>
          )}
        </section>
        <PublicFooter />
        <ScrollToTop />
      </div>
    </PageTransition>
  );
};

export default Contact;
