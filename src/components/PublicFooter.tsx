import { Link } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif font-bold text-foreground text-sm">Donna</p>
            <p className="text-xs text-muted-foreground mt-1">Votre employé numérique juridique</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-sans text-muted-foreground">
            <Link to="/produit" className="hover:text-foreground transition-colors">Solution</Link>
            <Link to="/a-propos" className="hover:text-foreground transition-colors">À propos</Link>
            <Link to="/demo" className="hover:text-foreground transition-colors">Demander une démo</Link>
            <Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">© 2026 Donna-Legal.ai</p>
        </div>
      </div>
    </footer>
  );
}
