import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Mic, MicOff, Calendar, MapPin, Users, Heart } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Logo from "@/components/Logo";
import { topCategories } from "@/data/serviceCategories";

const tabs = ["Featured", "Upcoming", "Trending", "Popular"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error("Voice search not supported"); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => setSearchQuery(event.results[0][0].transcript);
    recognition.onerror = () => { setIsListening(false); toast.error("Could not recognize speech"); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, []);

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

  const filteredEvents = events.filter((e) =>
    !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-5 pt-14 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
          <div>
            <Logo size="md" showWordmark={false} />
            <p className="text-sm text-muted-foreground mt-1">Hi, {displayName}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/profile/notifications")} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary min-w-[44px] min-h-[44px]">
              <Bell className="w-5 h-5 text-foreground" />
            </button>
            <button onClick={() => navigate("/profile")} className="w-10 h-10 rounded-full bg-primary overflow-hidden min-w-[44px] min-h-[44px] flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-primary-foreground">{displayName.charAt(0).toUpperCase()}</span>
              )}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search events" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-11 pr-12 h-12 bg-secondary border-0 rounded-xl text-foreground" />
          <button onClick={startVoiceSearch} className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isListening ? "bg-destructive animate-pulse" : "bg-primary"}`}>
            {isListening ? <MicOff className="w-4 h-4 text-primary-foreground" /> : <Mic className="w-4 h-4 text-primary-foreground" />}
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex gap-3 mb-6">
          <button onClick={() => navigate("/create")} className="flex-1 bg-brand-gradient text-white rounded-2xl py-4 text-base font-bold min-h-[44px] shadow-brand">
            Plan an Event
          </button>
          <button onClick={() => navigate("/vendors")} className="flex-1 bg-card border border-border text-foreground rounded-2xl py-4 text-base font-bold min-h-[44px]">
            Browse Vendors
          </button>
        </motion.div>

        {/* Top 10 service categories */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-display font-bold text-foreground">Browse Categories</h2>
            <button onClick={() => navigate("/vendors")} className="text-xs font-medium text-primary">See all</button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {topCategories.map((cat) => (
              <button key={cat.value} onClick={() => navigate(`/vendors?category=${cat.value}`)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-secondary/60 min-h-[64px]">
                <span className="w-10 h-10 rounded-xl bg-brand-gradient/10 flex items-center justify-center">
                  <cat.icon className="w-5 h-5 text-primary" />
                </span>
                <span className="text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2">{cat.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="px-5">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-xl font-display font-bold text-foreground mb-4">
          Your Events
        </motion.h2>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-1 pb-4">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab ? "text-foreground font-bold" : "text-muted-foreground"}`}>
              {tab}
            </button>
          ))}
        </motion.div>

        {filteredEvents.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 snap-x snap-mandatory">
            {filteredEvents.map((event, index) => (
              <motion.button key={event.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.08 }} onClick={() => navigate(`/events/${event.id}`)}
                className="flex-shrink-0 w-[280px] bg-card border border-border rounded-2xl overflow-hidden text-left snap-start">
                <div className="relative h-44 bg-secondary">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <button className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full" onClick={(e) => e.stopPropagation()}>
                    <Heart className="w-4 h-4 text-foreground" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-foreground mb-2 leading-tight line-clamp-2">{event.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {event.location && (
                      <span className="flex items-center gap-1 text-xs bg-secondary text-muted-foreground rounded-full px-2.5 py-1">
                        <MapPin className="w-3 h-3" /> {event.location}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{event.guest_count || 0} guests</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No events yet. Tap "Plan an Event" to get started!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
