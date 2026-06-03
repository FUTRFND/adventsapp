import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bell, Plus, Store, TrendingUp, Eye, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Logo from "@/components/Logo";

const BusinessDashboard = () => {
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

  const { data: services = [] } = useQuery({
    queryKey: ["user_services", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_services").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const displayName = (profile as any)?.business_name || profile?.full_name || "Business";
  const activeServices = services.filter((s: any) => s.is_active).length;

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-5 pt-14 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" showWordmark={false} />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">{displayName}</h1>
              <p className="text-sm text-muted-foreground">Business Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/profile/notifications")} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary">
              <Bell className="w-5 h-5 text-foreground" />
            </button>
            <button onClick={() => navigate("/profile")} className="w-10 h-10 rounded-full bg-primary overflow-hidden flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-primary-foreground">{displayName.charAt(0).toUpperCase()}</span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Store, label: "Active", value: activeServices, color: "text-foreground" },
            { icon: Eye, label: "Views", value: "—", color: "text-foreground" },
            { icon: TrendingUp, label: "Leads", value: "—", color: "text-foreground" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4 text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <Button className="w-full py-5 text-base font-semibold mb-6" onClick={() => navigate("/list-services")}>
          <Plus className="w-5 h-5 mr-2" /> Manage Services
        </Button>
      </div>

      {/* Services List */}
      <div className="px-5">
        <h2 className="text-lg font-display font-bold text-foreground mb-4">Your Listings</h2>
        {services.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm mb-4">No services listed yet</p>
            <Button variant="outline" onClick={() => navigate("/list-services")}>List Your First Service</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service: any, index: number) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`bg-card border border-border rounded-xl p-4 ${!service.is_active ? "opacity-60" : ""}`}
                onClick={() => navigate("/list-services")}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{service.name}</h3>
                    <p className="text-xs text-muted-foreground">{service.category}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${service.is_active ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"}`}>
                    {service.is_active ? "Active" : "Paused"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;
