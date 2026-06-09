import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Compass, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Explore = () => {
  const navigate = useNavigate();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["public_events"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("events")
        .select("*")
        .eq("visibility", "public")
        .order("date_start", { ascending: true, nullsFirst: false });
      return (data as any[]) || [];
    },
  });

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-5 pt-14 pb-4 brand-section-header">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">Explore</h1>
          </div>
          <Logo size="sm" showWordmark={false} />
        </div>
        <p className="text-sm text-muted-foreground">Public events from the Advents community.</p>
      </div>

      {isLoading ? (
        <div className="text-center text-sm text-muted-foreground py-12">Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 px-6">
          <Compass className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No public events yet — be the first to share one.</p>
        </div>
      ) : (
        <div className="px-5 space-y-3">
          {events.map((event, i) => (
            <motion.button
              key={event.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/events/${event.id}`)}
              className="w-full bg-card border border-border rounded-2xl overflow-hidden text-left"
            >
              {event.image_url ? (
                <img src={event.image_url} alt={event.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-brand-gradient flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-white/80" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-foreground">{event.name}</h3>
                <p className="text-xs text-muted-foreground capitalize mb-2">{event.type}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {event.date_start && (
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                      {new Date(event.date_start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                  {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.guest_count || 0} guests</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
