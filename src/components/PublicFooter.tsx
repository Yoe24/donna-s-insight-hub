import { Link } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif font-bold text-foreground text-sm">Donna</p>
            <p className="text-xs text-muted-foreground mt-1">Votre employée numérique juridique</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-sans text-muted-foreground">
            <Link to="/securite" className="hover:text-foreground transition-colors">Sécurité</Link>
            <Link to="/a-propos" className="hover:text-foreground transition-colors">À propos</Link>
            <Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link>
            <a href="mailto:donna@donna-legal.com" className="hover:text-foreground transition-colors">donna@donna-legal.com</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">© 2026 Donna-Legal.com</p>
        </div>
      </div>
    </footer>
  );
}
