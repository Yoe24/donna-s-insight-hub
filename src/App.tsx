import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { captureUserIdFromUrl, isDemo, getUserId } from "@/lib/auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Configuration from "./pages/Configuration";

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
import EmailsAutres from "./pages/EmailsAutres";
import DonnaChat from "./components/DonnaChat";
import DashboardV6 from "./pages/DashboardV6";

const LandingV1 = lazy(() => import("./pages/LandingV1"));
const LandingV2 = lazy(() => import("./pages/LandingV2"));
const LandingV3 = lazy(() => import("./pages/LandingV3"));
const LandingV4 = lazy(() => import("./pages/LandingV4"));
const LandingV5 = lazy(() => import("./pages/LandingV5"));

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Capture user_id from URL (OAuth callback)
  captureUserIdFromUrl();

  const hasUserId = !!localStorage.getItem("donna_user_id");
  const isDemoActive = isDemo();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!user && !hasUserId && !isDemoActive) {
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
  <ErrorBoundary>
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
            
            <Route path="/securite" element={<Securite />} />
            <Route path="/tarifs" element={<Tarifs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardV6 /></ProtectedRoute>} />
            <Route path="/dashboard-legacy" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/configuration" element={<ProtectedRoute><Configuration /></ProtectedRoute>} />
            <Route path="/fil" element={<ProtectedRoute><FilActualite /></ProtectedRoute>} />
            <Route path="/emails-autres" element={<ProtectedRoute><EmailsAutres /></ProtectedRoute>} />

            <Route path="/dossiers/:id" element={<ProtectedRoute><DossierDetail /></ProtectedRoute>} />
            <Route path="/v6" element={<ProtectedRoute><DashboardV6 /></ProtectedRoute>} />
            <Route path="/v1" element={<Suspense fallback={null}><LandingV1 /></Suspense>} />
            <Route path="/v2" element={<Suspense fallback={null}><LandingV2 /></Suspense>} />
            <Route path="/v3" element={<Suspense fallback={null}><LandingV3 /></Suspense>} />
            <Route path="/v4" element={<Suspense fallback={null}><LandingV4 /></Suspense>} />
            <Route path="/v5" element={<Suspense fallback={null}><LandingV5 /></Suspense>} />
            <Route path="/demo" element={<Navigate to="/onboarding?demo=true" replace />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
