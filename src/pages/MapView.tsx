import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const MapView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events = [] } = useQuery({
    queryKey: ["events", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const eventsWithLocation = events.filter((e) =>
    e.location && (!searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.location?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">Map</h1>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search event locations…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-11 h-12 bg-secondary border-0 rounded-xl" />
        </div>
      </div>

      {/* Map placeholder */}
      <div className="mx-5 h-64 bg-secondary rounded-2xl border border-border flex items-center justify-center mb-6">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">Map Coming Soon</p>
          <p className="text-xs mt-1">Provide a Google Maps API key to enable</p>
        </div>
      </div>

      {/* Event locations list */}
      <div className="px-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Event Locations</h2>
        {eventsWithLocation.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No events with locations found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventsWithLocation.map((event) => (
              <button
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl text-left hover:bg-secondary/50 transition-colors min-h-[44px]"
              >
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{event.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                </div>
                {event.date_start && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">{event.date_start}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
