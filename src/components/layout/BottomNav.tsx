import { useLocation, useNavigate } from "react-router-dom";
import { Compass, CalendarDays, MapPin, User, Plus, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile-type", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("account_type").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const accountType = (profile as any)?.account_type || "planner";

  const hiddenPaths = ["/wizard", "/auth", "/onboarding", "/role-selection", "/payment", "/event-simulation"];
  if (
    hiddenPaths.some(p => location.pathname === p || location.pathname.startsWith(p + "/")) ||
    location.pathname.includes("/tasks") ||
    location.pathname.includes("/notifications") ||
    location.pathname.includes("/billing") ||
    location.pathname.includes("/privacy") ||
    location.pathname.includes("/help") ||
    location.pathname.match(/^\/events\/[^/]+$/) ||
    location.pathname === "/create"
  ) return null;

  const plannerTabs = [
    { icon: Compass, label: "Explore", path: "/explore" },
    { icon: CalendarDays, label: "Events", path: "/events" },
    { icon: Plus, label: "", path: "/create", isCenter: true },
    { icon: MapPin, label: "Map", path: "/map" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const businessTabs = [
    { icon: Compass, label: "Explore", path: "/explore" },
    { icon: Store, label: "Services", path: "/list-services" },
    { icon: Plus, label: "", path: "/list-services", isCenter: true },
    { icon: MapPin, label: "Map", path: "/map" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const tabs = accountType === "business" ? businessTabs : plannerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-end justify-around px-2 pt-2 pb-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(tab.path);

          if (tab.isCenter) {
            return (
              <button key="center" onClick={() => navigate(tab.path)}
                className="relative -mt-4 flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-elevated"
                aria-label="Create">
                <tab.icon className="w-7 h-7 text-primary-foreground" />
              </button>
            );
          }

          return (
            <button key={tab.path + tab.label} onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors min-w-[44px] min-h-[44px] justify-center ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
