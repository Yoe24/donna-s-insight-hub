import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";

export function PublicNavbar({ invertColors = false }: { invertColors?: boolean }) {
  const [open, setOpen] = useState(false);

  const textClass = invertColors ? "text-background" : "text-foreground";
  const mutedClass = invertColors ? "text-background/60" : "text-muted-foreground";
  const hoverClass = invertColors ? "hover:text-background" : "hover:text-foreground";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50" style={invertColors ? { background: 'transparent', borderColor: 'transparent' } : {}}>
      <div className="flex items-center justify-between px-6 sm:px-10 py-4 max-w-7xl mx-auto w-full">
        <Link to="/">
          <h2 className={`text-xl sm:text-2xl font-serif font-bold tracking-tight ${textClass}`}>
            Donna
          </h2>
        </Link>

        {/* Desktop */}
        <div className={`hidden md:flex items-center gap-8 text-sm font-sans ${mutedClass}`}>
          <Link to="/securite" className={`${hoverClass} transition-colors`}>Sécurité</Link>
          <Link to="/tarifs" className={`${hoverClass} transition-colors`}>Tarifs</Link>
          <Link to="/contact" className={`${hoverClass} transition-colors`}>Nous contacter</Link>
          <Link to="/login" className={`${textClass} font-medium hover:opacity-70 transition-opacity`}>Se connecter</Link>
        </div>

        {/* Mobile hamburger */}
        <button className={`md:hidden ${mutedClass} ${hoverClass} transition-colors`} onClick={() => setOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile drawer */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-72 pt-12">
            <nav className="flex flex-col gap-6 text-base font-sans">
              <Link to="/securite" className="text-foreground hover:text-muted-foreground transition-colors" onClick={() => setOpen(false)}>Sécurité</Link>
              <Link to="/tarifs" className="text-foreground hover:text-muted-foreground transition-colors" onClick={() => setOpen(false)}>Tarifs</Link>
              <Link to="/contact" className="text-foreground hover:text-muted-foreground transition-colors" onClick={() => setOpen(false)}>Nous contacter</Link>
              <Link to="/login" className="text-foreground font-medium hover:text-muted-foreground transition-colors" onClick={() => setOpen(false)}>Se connecter</Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
