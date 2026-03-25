import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, BellOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const prefs = (profile?.notification_preferences as Record<string, boolean>) || { push: true, email: true };

  const updatePref = useMutation({
    mutationFn: async (newPrefs: Record<string, boolean>) => {
      const { error } = await supabase.from("profiles").update({
        notification_preferences: newPrefs,
      }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Preferences saved");
    },
  });

  const toggle = (key: string) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    updatePref.mutate(newPrefs);
  };

  return (
    <div className="pb-24 min-h-screen px-5 pt-14">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-display font-bold text-foreground">Notifications</h1>
      </div>

      <div className="space-y-4">
        {[
          { key: "push", label: "Push Notifications", desc: "Receive task reminders and event updates" },
          { key: "email", label: "Email Notifications", desc: "Get event summaries and reminders via email" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl min-h-[44px]">
            <div>
              <Label className="text-sm font-medium text-foreground">{item.label}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <Switch checked={prefs[item.key] ?? true} onCheckedChange={() => toggle(item.key)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;
