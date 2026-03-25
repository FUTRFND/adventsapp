import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Key, Trash2, Download, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PrivacySecurity = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const [{ data: profile }, { data: events }, { data: guests }, { data: tasks }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("events").select("*").eq("user_id", user.id),
        supabase.from("guests").select("*").eq("user_id", user.id),
        supabase.from("event_tasks").select("*").eq("user_id", user.id),
      ]);

      const exportData = { profile, events, guests, tasks, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `advents-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch {
      toast.error("Failed to export data");
    }
    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    toast.error("Account deletion requires contacting support. Please use the Help & Support page.");
  };

  const handleSignOutAll = async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed out of all sessions");
      navigate("/auth");
    }
  };

  const sections = [
    {
      icon: Key,
      title: "Change Password",
      content: (
        <div className="space-y-3 mt-3">
          <div>
            <Label className="text-xs text-muted-foreground">New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Confirm Password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="mt-1" />
          </div>
          <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword} className="w-full min-h-[44px]">
            {changingPassword ? "Updating…" : "Update Password"}
          </Button>
        </div>
      ),
    },
    {
      icon: Download,
      title: "Export Your Data",
      description: "Download all your events, guests, and tasks as a JSON file.",
      action: (
        <Button variant="outline" onClick={handleExportData} disabled={exporting} className="w-full min-h-[44px] mt-3">
          {exporting ? "Exporting…" : "Export Data"}
        </Button>
      ),
    },
    {
      icon: Monitor,
      title: "Session Management",
      description: "Sign out of all devices and sessions at once.",
      action: (
        <Button variant="outline" onClick={handleSignOutAll} className="w-full min-h-[44px] mt-3">
          Sign Out All Sessions
        </Button>
      ),
    },
    {
      icon: Trash2,
      title: "Delete Account",
      description: "Permanently delete your account and all associated data. This action cannot be undone.",
      action: (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full min-h-[44px] mt-3">Delete Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete your account and all data. This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ];

  return (
    <div className="pb-24 min-h-screen px-5 pt-14">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-display font-bold text-foreground">Privacy & Security</h1>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <section.icon className="w-5 h-5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-foreground">{section.title}</h3>
                {section.description && <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>}
              </div>
            </div>
            {section.content}
            {section.action}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrivacySecurity;
