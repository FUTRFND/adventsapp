import { useLocation, useNavigate } from "react-router-dom";
import { Compass, CalendarDays, MapPin, User, Plus } from "lucide-react";

const tabs = [
  { icon: Compass, label: "Explore", path: "/" },
  { icon: CalendarDays, label: "Events", path: "/events" },
  { icon: Plus, label: "", path: "/create", isCenter: true },
  { icon: MapPin, label: "Map", path: "/map" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenPaths = ["/wizard", "/auth", "/onboarding"];
  if (
    hiddenPaths.some(p => location.pathname === p || location.pathname.startsWith(p + "/")) ||
    location.pathname.includes("/guests") ||
    location.pathname.includes("/tasks") ||
    location.pathname.includes("/notifications") ||
    location.pathname.includes("/billing") ||
    location.pathname.includes("/privacy") ||
    location.pathname.includes("/help") ||
    location.pathname.match(/^\/events\/[^/]+$/)
  ) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-end justify-around px-2 pt-2 pb-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.path === "/" 
            ? location.pathname === "/" 
            : location.pathname.startsWith(tab.path);

          if (tab.isCenter) {
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative -mt-4 flex items-center justify-center w-14 h-14 rounded-full bg-primary shadow-elevated"
                aria-label="Create Event"
              >
                <tab.icon className="w-7 h-7 text-primary-foreground" />
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors min-w-[44px] min-h-[44px] justify-center ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
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
