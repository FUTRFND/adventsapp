import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, PlusCircle, Compass, User } from "lucide-react";

const tabs = [
  { icon: Compass, label: "Explore", path: "/" },
  { icon: Search, label: "Vendors", path: "/vendors" },
  { icon: PlusCircle, label: "", path: "/create", isCenter: true },
  { icon: Home, label: "Events", path: "/events" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on wizard
  if (location.pathname === "/wizard") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-end justify-around px-2 pt-2 pb-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;

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
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
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
