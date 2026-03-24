import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Settings, ChevronRight, LogOut, Bell, Shield, HelpCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
  { name: "Chloe's Wedding", color: "bg-secondary", emoji: "💍" },
  { name: "Team Offsite", color: "bg-secondary", emoji: "🏢", collaborators: 3 },
  { name: "Birthday Bash", color: "bg-secondary", emoji: "🎂" },
];

const settingsItems = [
  { icon: Bell, label: "Notifications", href: "#" },
  { icon: CreditCard, label: "Subscription & Billing", href: "#" },
  { icon: Shield, label: "Privacy & Security", href: "#" },
  { icon: HelpCircle, label: "Help & Support", href: "#" },
];

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="px-5 pt-14 pb-6 text-center">
        <h1 className="text-xl font-display font-bold text-foreground mb-6">Profile</h1>

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block mb-4"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-accent mx-auto">
            <img
              src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face"
              alt="Chloe Davis"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
        <h2 className="text-xl font-display font-bold text-foreground">Chloe Davis</h2>
        <p className="text-sm text-muted-foreground">Chloe.Davis@email.com</p>
      </div>

      {/* Create New Event */}
      <div className="px-5 mb-6">
        <Button
          className="w-full py-6 text-base font-semibold"
          onClick={() => navigate("/create")}
        >
          Create New Event
        </Button>
      </div>

      {/* My Events */}
      <div className="px-5 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">My Events</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {events.map((event) => (
            <button
              key={event.name}
              className="flex-shrink-0 bg-card border border-border rounded-xl p-4 w-36 text-left hover:shadow-soft transition-shadow"
            >
              <span className="text-2xl mb-2 block">{event.emoji}</span>
              <span className="text-sm font-medium text-foreground block leading-tight">{event.name}</span>
              {event.collaborators && (
                <div className="flex -space-x-1 mt-2">
                  {Array.from({ length: event.collaborators }).map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-metallic-mid border border-background overflow-hidden">
                      <img src={`https://i.pravatar.cc/24?img=${i + 20}`} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Settings</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {settingsItems.map((item, index) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 transition-colors ${
                index < settingsItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <button className="w-full flex items-center gap-3 px-4 py-3.5 mt-4 text-left text-destructive">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
