import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Users, Share2, Heart, DollarSign, ClipboardList, Pencil, X, ImagePlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editType, setEditType] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editGuestCount, setEditGuestCount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [budgetName, setBudgetName] = useState("");
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetEstimated, setBudgetEstimated] = useState("");
  const [budgetActual, setBudgetActual] = useState("");
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("id", eventId!).single();
      return data;
    },
    enabled: !!eventId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["event_tasks", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("event_tasks").select("*").eq("event_id", eventId!).order("sort_order");
      return data || [];
    },
    enabled: !!eventId,
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["guests", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("guests").select("*").eq("event_id", eventId!);
      return data || [];
    },
    enabled: !!eventId,
  });

  const { data: budgetItems = [] } = useQuery({
    queryKey: ["budget_items", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("budget_items").select("*").eq("event_id", eventId!).order("created_at");
      return data || [];
    },
    enabled: !!eventId,
  });

  const startEditing = () => {
    if (!event) return;
    setEditName(event.name);
    setEditDate(event.date_start || "");
    setEditLocation(event.location || "");
    setEditType(event.type);
    setEditBudget(String(event.budget || ""));
    setEditGuestCount(String(event.guest_count || ""));
    setEditDescription((event as any).description || "");
    setIsEditing(true);
  };

  const saveEdit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("events").update({
        name: editName.trim(),
        date_start: editDate || null,
        location: editLocation || null,
        type: editType,
        budget: parseFloat(editBudget) || 0,
        guest_count: parseInt(editGuestCount) || 0,
        description: editDescription.trim() || null,
      } as any).eq("id", eventId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsEditing(false);
      toast.success("Event updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("event-images").upload(path, file);
    if (error) { toast.error("Upload failed"); return; }
    const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
    await supabase.from("events").update({ image_url: urlData.publicUrl } as any).eq("id", eventId!);
    queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    toast.success("Image updated");
  };

  const toggleTask = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      await supabase.from("event_tasks").update({ is_completed: completed }).eq("id", taskId);
      const updatedTasks = tasks.map((t) => t.id === taskId ? { ...t, is_completed: completed } : t);
      const completedCount = updatedTasks.filter((t) => t.is_completed).length;
      const progress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
      await supabase.from("events").update({ progress }).eq("id", eventId!);
      try { if (navigator.vibrate) navigator.vibrate(10); } catch {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_tasks", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const addBudgetItem = useMutation({
    mutationFn: async () => {
      if (!budgetName.trim()) throw new Error("Name required");
      const { error } = await supabase.from("budget_items").insert({
        event_id: eventId!, user_id: user!.id, name: budgetName.trim(),
        category: budgetCategory.trim() || "General",
        estimated_cost: parseFloat(budgetEstimated) || 0,
        actual_cost: parseFloat(budgetActual) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget_items", eventId] });
      setBudgetName(""); setBudgetCategory(""); setBudgetEstimated(""); setBudgetActual("");
      setShowBudgetForm(false);
      toast.success("Budget item added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePaid = useMutation({
    mutationFn: async ({ id, isPaid }: { id: string; isPaid: boolean }) => {
      await supabase.from("budget_items").update({ is_paid: isPaid }).eq("id", id);
      try { if (navigator.vibrate) navigator.vibrate(10); } catch {}
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget_items", eventId] }),
  });

  const handleShare = async () => {
    const shareData = { title: event?.name || "My Event", text: `Check out my event: ${event?.name}`, url: window.location.href };
    try {
      if (navigator.share) { await navigator.share(shareData); }
      else { await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); toast.success("Event link copied!"); }
    } catch (e: any) {
      if (e?.name !== "AbortError") { await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); toast.success("Event link copied!"); }
    }
  };

  const confirmedGuests = guests.filter((g) => g.rsvp_status === "confirmed").length;
  const totalEstimated = budgetItems.reduce((s, i) => s + Number(i.estimated_cost || 0), 0);
  const totalActual = budgetItems.reduce((s, i) => s + Number(i.actual_cost || 0), 0);
  const tasksByCategory = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    const cat = task.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});
  const budgetByCategory = budgetItems.reduce<Record<string, { estimated: number; actual: number }>>((acc, item) => {
    const cat = item.category || "General";
    if (!acc[cat]) acc[cat] = { estimated: 0, actual: 0 };
    acc[cat].estimated += Number(item.estimated_cost || 0);
    acc[cat].actual += Number(item.actual_cost || 0);
    return acc;
  }, {});
  const chartData = Object.entries(budgetByCategory).map(([name, values]) => ({ name, ...values }));
  const descriptionText = (event as any)?.description || "";
  const perPerson = event?.budget && event?.guest_count ? Math.round(Number(event.budget) / event.guest_count) : null;

  // Edit mode
  if (isEditing) {
    return (
      <div className="pb-24 min-h-screen">
        <div className="px-5 pt-14 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setIsEditing(false)} className="p-2 -ml-2 hover:bg-secondary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-display font-bold text-foreground flex-1">Edit Event</h1>
            <Button size="sm" onClick={() => saveEdit.mutate()} disabled={saveEdit.isPending}>
              {saveEdit.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        <div className="px-5 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Event Name</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-12 bg-secondary border-0" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Event Type</Label>
            <Input value={editType} onChange={(e) => setEditType(e.target.value)} className="h-12 bg-secondary border-0" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Date</Label>
            <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="h-12 bg-secondary border-0" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Location</Label>
            <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="h-12 bg-secondary border-0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Guest Count</Label>
              <Input type="number" value={editGuestCount} onChange={(e) => setEditGuestCount(e.target.value)} className="h-12 bg-secondary border-0" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Budget</Label>
              <Input type="number" value={editBudget} onChange={(e) => setEditBudget(e.target.value)} className="h-12 bg-secondary border-0" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Description</Label>
            <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="bg-secondary border-0 min-h-[100px]" />
          </div>
          {/* Image upload in edit */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Event Image</Label>
            <label className="flex items-center gap-3 p-4 bg-secondary rounded-xl cursor-pointer hover:bg-muted transition-colors">
              <ImagePlus className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload new image</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen">
      {/* Hero image */}
      <div className="relative">
        <div className="h-64 bg-secondary">
          {(event as any)?.image_url ? (
            <img src={(event as any).image_url} alt={event?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="w-16 h-16 text-muted-foreground/20" />
            </div>
          )}
        </div>
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-14">
          <button onClick={() => navigate(-1)} className="p-2 bg-background/80 backdrop-blur-sm rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-sm font-display font-bold text-foreground bg-background/80 backdrop-blur-sm rounded-full px-4 py-2">See What's Happening</h1>
          <button onClick={handleShare} className="p-2 bg-background/80 backdrop-blur-sm rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <div className="absolute -bottom-5 left-5 right-5">
          <div className="bg-background rounded-full shadow-lg px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(Math.min(3, guests.length || 1))].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground">+{guests.length} Going</span>
            </div>
            <Button size="sm" className="rounded-full px-5" onClick={() => navigate(`/events/${eventId}/guests`)}>Invite</Button>
          </div>
        </div>
      </div>

      {/* Event info */}
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-display font-bold text-foreground flex-1">{event?.name || "Event"}</h1>
          <button onClick={startEditing} className="p-2 hover:bg-secondary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Pencil className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {event?.date_start && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{format(new Date(event.date_start + "T00:00:00"), "EEE, dd MMMM yyyy")}</p>
              <p className="text-xs text-muted-foreground">Event day</p>
            </div>
          </div>
        )}

        {event?.location && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{event.location}</p>
              <p className="text-xs text-muted-foreground">{event.location}</p>
            </div>
          </div>
        )}

        {perPerson && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">${perPerson}</p>
              <p className="text-xs text-muted-foreground">Per person</p>
            </div>
          </div>
        )}

        {descriptionText && (
          <div className="mb-4">
            <h2 className="text-lg font-display font-bold text-foreground mb-2">About event</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {showFullDesc ? descriptionText : descriptionText.slice(0, 200)}
              {descriptionText.length > 200 && (
                <button onClick={() => setShowFullDesc(!showFullDesc)} className="text-foreground font-medium ml-1">
                  {showFullDesc ? "Show Less" : "…Read More"}
                </button>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="px-5">
        <TabsList className="w-full bg-secondary mb-4">
          <TabsTrigger value="tasks" className="flex-1 gap-1.5 min-h-[44px]"><ClipboardList className="w-4 h-4" /> Tasks</TabsTrigger>
          <TabsTrigger value="guests" className="flex-1 gap-1.5 min-h-[44px]"><Users className="w-4 h-4" /> Guests</TabsTrigger>
          <TabsTrigger value="budget" className="flex-1 gap-1.5 min-h-[44px]"><DollarSign className="w-4 h-4" /> Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-5">
          {tasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm mb-3">No tasks yet</p>
              <Button variant="outline" onClick={() => navigate(`/wizard/${eventId}`)}>Run Planning Wizard</Button>
            </div>
          )}
          {Object.entries(tasksByCategory).map(([cat, catTasks]) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{cat}</h3>
              <div className="space-y-1">
                {catTasks.map((task) => (
                  <label key={task.id} className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors min-h-[44px]">
                    <Checkbox checked={task.is_completed ?? false} onCheckedChange={(checked) => toggleTask.mutate({ taskId: task.id, completed: !!checked })} className="mt-0.5" />
                    <span className={`text-sm font-medium flex-1 ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="guests">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{guests.length} guests · {confirmedGuests} confirmed</p>
            <Button size="sm" onClick={() => navigate(`/events/${eventId}/guests`)}>Manage</Button>
          </div>
          {guests.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm mb-3">No guests yet</p>
              <Button variant="outline" onClick={() => navigate(`/events/${eventId}/guests`)}>Add Guests</Button>
            </div>
          )}
          <div className="space-y-2">
            {guests.slice(0, 10).map((guest) => (
              <div key={guest.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
                <span className="text-sm font-medium text-foreground">{guest.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${guest.rsvp_status === "confirmed" ? "bg-secondary text-foreground" : guest.rsvp_status === "declined" ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"}`}>
                  {guest.rsvp_status || "pending"}
                </span>
              </div>
            ))}
            {guests.length > 10 && <Button variant="ghost" className="w-full" onClick={() => navigate(`/events/${eventId}/guests`)}>View all {guests.length} guests</Button>}
          </div>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Estimated</p>
              <p className="text-lg font-bold text-foreground">${totalEstimated.toLocaleString()}</p>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Actual</p>
              <p className={`text-lg font-bold ${totalActual > totalEstimated ? "text-destructive" : "text-foreground"}`}>${totalActual.toLocaleString()}</p>
            </div>
          </div>
          {chartData.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">By Category</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barGap={4}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar dataKey="estimated" radius={[4, 4, 0, 0]} fill="hsl(var(--border))" />
                  <Bar dataKey="actual" radius={[4, 4, 0, 0]} fill="hsl(var(--foreground))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Items</h3>
            <Button size="sm" variant="outline" onClick={() => setShowBudgetForm(!showBudgetForm)}>{showBudgetForm ? "Cancel" : "+ Add"}</Button>
          </div>
          {showBudgetForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <Input value={budgetName} onChange={(e) => setBudgetName(e.target.value)} placeholder="Item name" className="h-11 bg-secondary border-0" />
              <Input value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)} placeholder="Category" className="h-11 bg-secondary border-0" />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" value={budgetEstimated} onChange={(e) => setBudgetEstimated(e.target.value)} placeholder="Estimated $" className="h-11 bg-secondary border-0" />
                <Input type="number" value={budgetActual} onChange={(e) => setBudgetActual(e.target.value)} placeholder="Actual $" className="h-11 bg-secondary border-0" />
              </div>
              <Button onClick={() => addBudgetItem.mutate()} className="w-full" disabled={addBudgetItem.isPending}>Add Item</Button>
            </motion.div>
          )}
          {budgetItems.length === 0 && !showBudgetForm && (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No budget items yet</p>
            </div>
          )}
          <div className="space-y-2">
            {budgetItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl min-h-[44px]">
                <Checkbox checked={item.is_paid ?? false} onCheckedChange={(checked) => togglePaid.mutate({ id: item.id, isPaid: !!checked })} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.is_paid ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">${Number(item.estimated_cost || 0).toLocaleString()}</p>
                  <p className="text-sm font-semibold text-foreground">${Number(item.actual_cost || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventDetail;
