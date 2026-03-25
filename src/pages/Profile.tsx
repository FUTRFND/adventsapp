import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, LogOut, Bell, Shield, HelpCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!user,
  });

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const eventTypeLabels: Record<string, string> = { wedding: "Wedding", corporate: "Corporate", birthday: "Birthday", social: "Social", graduation: "Graduation", fundraiser: "Fundraiser" };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const settingsItems = [
    { icon: Bell, label: "Notifications", action: () => navigate("/profile/notifications") },
    { icon: CreditCard, label: "Subscription & Billing", action: () => navigate("/profile/billing") },
    { icon: Shield, label: "Privacy & Security", action: () => navigate("/profile/privacy") },
    { icon: HelpCircle, label: "Help & Support", action: () => navigate("/profile/help") },
  ];

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-5 pt-14 pb-6 text-center">
        <h1 className="text-xl font-display font-bold text-foreground mb-6">Profile</h1>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-accent mx-auto bg-secondary flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-foreground">{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </motion.div>
        <h2 className="text-xl font-display font-bold text-foreground">{displayName}</h2>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      <div className="px-5 mb-6">
        <Button className="w-full py-6 text-base font-semibold min-h-[44px]" onClick={() => navigate("/create")}>Create New Event</Button>
      </div>

      {events.length > 0 && (
        <div className="px-5 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">My Events</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {events.map((event) => (
              <button key={event.id} onClick={() => navigate(`/events/${event.id}`)}
                className="flex-shrink-0 bg-card border border-border rounded-xl p-4 w-36 text-left hover:shadow-soft transition-shadow min-h-[44px]">
                <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">{eventTypeLabels[event.type] || event.type}</span>
                <span className="text-sm font-medium text-foreground block leading-tight">{event.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Settings</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {settingsItems.map((item, index) => (
            <button key={item.label} onClick={item.action}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/50 transition-colors min-h-[44px] ${index < settingsItems.length - 1 ? "border-b border-border" : ""}`}>
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3.5 mt-4 text-left text-destructive min-h-[44px]">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
