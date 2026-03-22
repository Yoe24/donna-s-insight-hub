import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Configuration from "./pages/Configuration";
import Dossiers from "./pages/Dossiers";
import DossierDetail from "./pages/DossierDetail";
import Onboarding from "./pages/Onboarding";
import Produit from "./pages/Produit";
import APropos from "./pages/APropos";

import Securite from "./pages/Securite";
import Tarifs from "./pages/Tarifs";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import NotFound from "./pages/NotFound";
import FilActualite from "./pages/FilActualite";
import DonnaChat from "./components/DonnaChat";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Capturer le user_id depuis l'URL (retour OAuth) AVANT de vérifier localStorage
  const params = new URLSearchParams(window.location.search);
  const urlUserId = params.get("user_id");
  if (urlUserId) {
    localStorage.setItem("donna_user_id", urlUserId);
    window.history.replaceState({}, "", window.location.pathname);
  }

  const hasLocalUserId = !!localStorage.getItem("donna_user_id");

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!user && !hasLocalUserId) {
    window.location.replace("/login");
    return null;
  }
  
  return (
    <>
      {children}
      <DonnaChat />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/produit" element={<Produit />} />
            <Route path="/a-propos" element={<APropos />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/securite" element={<Securite />} />
            <Route path="/tarifs" element={<Tarifs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/configuration" element={<ProtectedRoute><Configuration /></ProtectedRoute>} />
            <Route path="/fil" element={<ProtectedRoute><FilActualite /></ProtectedRoute>} />
            <Route path="/dossiers" element={<ProtectedRoute><Dossiers /></ProtectedRoute>} />
            <Route path="/dossiers/:id" element={<ProtectedRoute><DossierDetail /></ProtectedRoute>} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
