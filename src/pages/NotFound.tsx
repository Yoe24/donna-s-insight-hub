import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center max-w-sm">
          <Link to="/">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8">Donna</h2>
          </Link>
          <h1 className="text-6xl font-serif font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground font-sans mb-8">
            Cette page n'existe pas. Donna non plus ne la trouve pas.
          </p>
          <Link to="/">
            <button className="bg-foreground text-background px-8 py-3 rounded-full text-sm font-sans font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 min-h-[48px]">
              Retour à l'accueil
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
