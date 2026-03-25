import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wand2, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
      const { data } = await supabase.from("events").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "there";
  const upcomingEvent = events[0];

  return (
    <div className="pb-24 px-5 pt-14">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Hi, {displayName}!</h1>
          <p className="text-sm text-muted-foreground">Welcome back, ready to plan?</p>
        </div>
        <button onClick={() => navigate("/profile")} className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-sm font-bold text-foreground">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </button>
      </motion.div>

      {upcomingEvent && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-secondary rounded-2xl p-5 mb-6 cursor-pointer" onClick={() => navigate("/events")}>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Upcoming event</span>
          <div className="flex items-center gap-3 mt-2">
            <Calendar className="w-5 h-5 text-foreground" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{upcomingEvent.name}</h3>
              <p className="text-sm text-muted-foreground">{upcomingEvent.date_start || "No date set"}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
        <Button onClick={() => navigate("/create")} className="w-full py-6 text-base font-semibold mb-3">
          <Wand2 className="w-5 h-5 mr-2" />
          Create New Event
        </Button>
      </motion.div>

      {events.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Your events</h2>
            <button onClick={() => navigate("/events")} className="text-xs text-muted-foreground">View all</button>
          </div>
          <div className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{event.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">{event.type} • {event.guest_count} guests</p>
                  </div>
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                      <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--foreground))" strokeWidth="3"
                        strokeDasharray={`${(event.progress || 0) * 1.256} 125.6`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
                      {event.progress || 0}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {events.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-center py-12 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No events yet. Create your first one!</p>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
