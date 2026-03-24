import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/layout/BottomNav";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import PlanningWizard from "./pages/PlanningWizard";
import Profile from "./pages/Profile";
import VendorMarketplace from "./pages/VendorMarketplace";
import EventsList from "./pages/EventsList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="max-w-lg mx-auto min-h-screen bg-background relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/wizard" element={<PlanningWizard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/vendors" element={<VendorMarketplace />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
