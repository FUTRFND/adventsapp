import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, LogOut, Bell, Shield, HelpCircle, CreditCard, Store, Calendar, Camera, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const accountType = (profile as any)?.account_type || "planner";
  const displayName = (profile as any)?.business_name || profile?.full_name || user?.email?.split("@")[0] || "User";

  const updateAvatar = useMutation({
    mutationFn: async (url: string | null) => {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url } as any)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile-role"] });
      queryClient.invalidateQueries({ queryKey: ["profile-type"] });
    },
  });

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("event-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
    await updateAvatar.mutateAsync(urlData.publicUrl);
    setUploading(false);
    toast.success("Profile photo updated");
  };

  const removeAvatar = async () => {
    await updateAvatar.mutateAsync(null);
    toast.success("Profile photo removed");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const settingsItems = [
    ...(accountType === "planner" ? [
      { icon: Store, label: "Browse Vendors", action: () => navigate("/vendors") },
    ] : [
      { icon: Store, label: "Manage Services", action: () => navigate("/list-services") },
    ]),
    { icon: Bell, label: "Notifications", action: () => navigate("/profile/notifications") },
    { icon: CreditCard, label: "Subscription & Billing", action: () => navigate("/profile/billing") },
    { icon: Shield, label: "Privacy & Security", action: () => navigate("/profile/privacy") },
    { icon: HelpCircle, label: "Help & Support", action: () => navigate("/profile/help") },
  ];

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-5 pt-14 pb-6 text-center">
        <h1 className="text-xl font-display font-bold text-foreground mb-6">Profile</h1>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-block mb-4 relative">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-card mx-auto bg-brand-gradient flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-brand-gradient text-white flex items-center justify-center shadow-brand"
            aria-label="Change photo"
            disabled={uploading}
          >
            <Camera className="w-4 h-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </motion.div>
        <h2 className="text-xl font-display font-bold text-foreground">{displayName}</h2>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-secondary rounded-full text-xs font-medium text-muted-foreground capitalize">
          {accountType === "business" ? "Business Account" : "Event Planner"}
        </span>
        {profile?.avatar_url && (
          <button onClick={removeAvatar} className="block mx-auto mt-2 text-xs text-destructive inline-flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Remove photo
          </button>
        )}
      </div>

      <div className="px-5 mb-6">
        <Button className="w-full py-6 text-base font-semibold min-h-[44px] bg-brand-gradient text-white"
          onClick={() => navigate(accountType === "business" ? "/list-services" : "/create")}>
          {accountType === "business" ? "Manage Services" : "Create New Event"}
        </Button>
      </div>

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

        <button onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-3 px-4 py-3.5 mt-4 text-left text-foreground min-h-[44px] bg-secondary rounded-xl">
          {accountType === "business" ? <Calendar className="w-5 h-5" /> : <Store className="w-5 h-5" />}
          <span className="text-sm font-medium">Switch to {accountType === "business" ? "Event Planner" : "Business"} Account</span>
        </button>

        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3.5 mt-4 text-left text-destructive min-h-[44px]">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
