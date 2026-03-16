import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function PublicNavbar({ invertColors = false }: { invertColors?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textClass = invertColors ? "text-background" : "text-foreground";
  const mutedClass = invertColors ? "text-background/60" : "text-muted-foreground";
  const hoverClass = invertColors ? "hover:text-background" : "hover:text-foreground";

  const handleDemoClick = () => {
    const el = document.getElementById("demo");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#demo";
    }
  };

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
          <Link to="/a-propos" className={`${hoverClass} transition-colors`}>À propos</Link>
          <Link to="/login" className={`${textClass} font-medium hover:opacity-70 transition-opacity`}>Se connecter</Link>
          <button
            onClick={handleDemoClick}
            className={`overflow-hidden transition-all duration-500 ease-out font-medium ${
              scrolled
                ? "max-w-[200px] opacity-100 translate-x-0 px-5 py-2 bg-foreground text-background rounded-lg hover:opacity-90"
                : "max-w-0 opacity-0 translate-x-4 px-0 py-2"
            }`}
            style={{ whiteSpace: "nowrap" }}
          >
            Demander une démo
          </button>
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
              <Link to="/a-propos" className="text-foreground hover:text-muted-foreground transition-colors" onClick={() => setOpen(false)}>À propos</Link>
              <Link to="/login" className="text-foreground font-medium hover:text-muted-foreground transition-colors" onClick={() => setOpen(false)}>Se connecter</Link>
              <button
                onClick={() => { setOpen(false); handleDemoClick(); }}
                className="text-left bg-foreground text-background font-medium px-5 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Demander une démo
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
