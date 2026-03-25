import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, UserCheck, UserX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusIcons: Record<string, any> = {
  confirmed: { icon: UserCheck, color: "text-green-600" },
  declined: { icon: UserX, color: "text-destructive" },
  pending: { icon: Clock, color: "text-muted-foreground" },
};

const GuestManagement = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("id", eventId!).single();
      return data;
    },
    enabled: !!eventId,
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["guests", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("guests").select("*").eq("event_id", eventId!).order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!eventId,
  });

  const addGuest = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Name required");
      const { error } = await supabase.from("guests").insert({
        event_id: eventId!,
        user_id: user!.id,
        name: name.trim(),
        email: email.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests", eventId] });
      setName("");
      setEmail("");
      setShowAdd(false);
      toast.success("Guest added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ guestId, status }: { guestId: string; status: string }) => {
      const { error } = await supabase.from("guests").update({ rsvp_status: status }).eq("id", guestId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["guests", eventId] }),
  });

  const deleteGuest = useMutation({
    mutationFn: async (guestId: string) => {
      const { error } = await supabase.from("guests").delete().eq("id", guestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests", eventId] });
      toast.success("Guest removed");
    },
  });

  const confirmed = guests.filter(g => g.rsvp_status === "confirmed").length;
  const declined = guests.filter(g => g.rsvp_status === "declined").length;
  const pending = guests.filter(g => g.rsvp_status === "pending").length;

  return (
    <div className="pb-24 min-h-screen">
      <div className="sticky top-0 bg-background z-10 px-5 pt-14 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="text-foreground"><ArrowLeft className="w-6 h-6" /></button>
          <div className="flex-1 text-center pr-6">
            <h1 className="text-lg font-display font-bold text-foreground">{event?.name || "Guests"}</h1>
            <p className="text-xs text-muted-foreground">{guests.length} guests</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-secondary rounded-lg p-3 text-center">
            <span className="text-lg font-bold text-foreground">{confirmed}</span>
            <p className="text-[10px] text-muted-foreground">Confirmed</p>
          </div>
          <div className="flex-1 bg-secondary rounded-lg p-3 text-center">
            <span className="text-lg font-bold text-foreground">{pending}</span>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </div>
          <div className="flex-1 bg-secondary rounded-lg p-3 text-center">
            <span className="text-lg font-bold text-foreground">{declined}</span>
            <p className="text-[10px] text-muted-foreground">Declined</p>
          </div>
        </div>

        <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? "outline" : "default"} className="w-full">
          <Plus className="w-4 h-4 mr-2" />{showAdd ? "Cancel" : "Add Guest"}
        </Button>
      </div>

      <div className="px-5 space-y-3 mt-4">
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Guest name" className="h-11 bg-secondary border-0" />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" type="email" className="h-11 bg-secondary border-0" />
            <Button onClick={() => addGuest.mutate()} className="w-full" disabled={addGuest.isPending}>Add</Button>
          </motion.div>
        )}

        {guests.map((guest, index) => {
          const statusInfo = statusIcons[guest.rsvp_status || "pending"];
          const StatusIcon = statusInfo.icon;
          return (
            <motion.div key={guest.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{guest.name}</p>
                  {guest.email && <p className="text-xs text-muted-foreground">{guest.email}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <select value={guest.rsvp_status || "pending"} onChange={(e) => updateStatus.mutate({ guestId: guest.id, status: e.target.value })}
                    className="text-xs bg-secondary border-0 rounded-lg px-2 py-1.5 text-foreground">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="declined">Declined</option>
                  </select>
                  <button onClick={() => deleteGuest.mutate(guest.id)} className="p-1.5 hover:bg-secondary rounded-lg">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {guests.length === 0 && !showAdd && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No guests added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestManagement;
