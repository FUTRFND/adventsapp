import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import BottomNav from "@/components/layout/BottomNav";
import Dashboard from "./pages/Dashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import CreateEvent from "./pages/CreateEvent";
import PlanningWizard from "./pages/PlanningWizard";
import Profile from "./pages/Profile";
import VendorMarketplace from "./pages/VendorMarketplace";
import ListServices from "./pages/ListServices";
import EventsList from "./pages/EventsList";
import EventDetail from "./pages/EventDetail";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import RoleSelection from "./pages/RoleSelection";
import PaymentReview from "./pages/PaymentReview";
import EventSimulation from "./pages/EventSimulation";
import TaskChecklist from "./pages/TaskChecklist";
import NotificationSettings from "./pages/NotificationSettings";
import SubscriptionBilling from "./pages/SubscriptionBilling";
import PrivacySecurity from "./pages/PrivacySecurity";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import HelpSupport from "./pages/HelpSupport";
import NotFound from "./pages/NotFound";
import MapView from "./pages/MapView";
import Explore from "./pages/Explore";
import DecorInspiration from "./pages/DecorInspiration";
import PageTransition from "./components/layout/PageTransition";
import MobileOnlyGate from "./components/layout/MobileOnlyGate";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const RoleGate = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-role", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("account_type").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
    staleTime: 60000,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  const accountType = (profile as any)?.account_type;
  if (!accountType || accountType === "planner") {
    // Default planner — already has a type set or uses default
    return <>{children}</>;
  }
  return <>{children}</>;
};

const HomeDashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["profile-role", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("account_type").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const accountType = (profile as any)?.account_type;
  if (accountType === "business") return <BusinessDashboard />;
  return <Dashboard />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const hasOnboarded = localStorage.getItem("advents_onboarded") === "true";

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto min-h-screen relative">
      <Routes>
        <Route path="/onboarding" element={hasOnboarded ? <Navigate to="/auth" replace /> : <Onboarding />} />
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : (hasOnboarded ? <Auth /> : <Navigate to="/onboarding" replace />)} />
        <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><PageTransition><HomeDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><PaymentReview /></ProtectedRoute>} />
        <Route path="/event-simulation" element={<ProtectedRoute><EventSimulation /></ProtectedRoute>} />
        <Route path="/wizard" element={<ProtectedRoute><PlanningWizard /></ProtectedRoute>} />
        <Route path="/wizard/:eventId" element={<ProtectedRoute><PlanningWizard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
        <Route path="/profile/notifications" element={<ProtectedRoute><PageTransition><NotificationSettings /></PageTransition></ProtectedRoute>} />
        <Route path="/profile/billing" element={<ProtectedRoute><PageTransition><SubscriptionBilling /></PageTransition></ProtectedRoute>} />
        <Route path="/profile/privacy" element={<ProtectedRoute><PageTransition><PrivacySecurity /></PageTransition></ProtectedRoute>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/profile/help" element={<ProtectedRoute><PageTransition><HelpSupport /></PageTransition></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><PageTransition><MapView /></PageTransition></ProtectedRoute>} />
        <Route path="/vendors" element={<ProtectedRoute><PageTransition><VendorMarketplace /></PageTransition></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><PageTransition><Explore /></PageTransition></ProtectedRoute>} />
        <Route path="/decor" element={<ProtectedRoute><PageTransition><DecorInspiration /></PageTransition></ProtectedRoute>} />
        <Route path="/list-services" element={<ProtectedRoute><PageTransition><ListServices /></PageTransition></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><PageTransition><EventsList /></PageTransition></ProtectedRoute>} />
        <Route path="/events/:eventId" element={<ProtectedRoute><PageTransition><EventDetail /></PageTransition></ProtectedRoute>} />
        <Route path="/events/:eventId/tasks" element={<ProtectedRoute><PageTransition><TaskChecklist /></PageTransition></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <BottomNav />}
    </div>
  );
};

const UnavailableWall = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-6">
    <div className="text-center max-w-sm">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
        <span className="text-2xl">🔒</span>
      </div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-3">Temporarily Unavailable</h1>
      <p className="text-muted-foreground text-sm">
        This application is currently undergoing maintenance and is temporarily unavailable. Please check back later.
      </p>
    </div>
  </div>
);

const SITE_LOCKED = false;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {SITE_LOCKED ? (
        <UnavailableWall />
      ) : (
        <BrowserRouter>
          <AuthProvider>
            <MobileOnlyGate>
              <AppRoutes />
            </MobileOnlyGate>
          </AuthProvider>
        </BrowserRouter>
      )}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
