import { motion } from "framer-motion";
import { Calendar, ClipboardList, Plus, Trash2, Users, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useCallback } from "react";

const EventsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted");
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["events"] });
    setTimeout(() => setRefreshing(false), 600);
  }, [queryClient]);

  return (
    <div className="pb-24 min-h-screen px-5 pt-14">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">My Events</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-secondary">
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <Button size="sm" onClick={() => navigate("/create")} className="min-h-[44px]"><Plus className="w-4 h-4 mr-1" />New</Button>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}

      {!isLoading && events.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm mb-4">No events yet</p>
          <Button onClick={() => navigate("/create")} className="min-h-[44px]">Create Your First Event</Button>
        </div>
      )}

      <div className="space-y-3">
        {events.map((event, index) => (
          <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }} className="bg-card border border-border rounded-xl p-4 cursor-pointer"
            onClick={() => navigate(`/events/${event.id}`)}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{event.name}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{event.type}</p>
                <p className="text-xs text-muted-foreground ml-6 mt-1">{event.guest_count} guests • {event.date_start || "No date"}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}/tasks`); }} className="p-2 hover:bg-secondary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}/guests`); }} className="p-2 hover:bg-secondary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteEvent.mutate(event.id); }} className="p-2 hover:bg-secondary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
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
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventsList;
