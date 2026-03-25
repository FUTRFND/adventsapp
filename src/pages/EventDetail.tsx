import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Users, Share2, ClipboardList, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Share } from "@capacitor/share";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Budget form state
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

  const toggleTask = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      await supabase.from("event_tasks").update({ is_completed: completed }).eq("id", taskId);
      const updatedTasks = tasks.map((t) => t.id === taskId ? { ...t, is_completed: completed } : t);
      const completedCount = updatedTasks.filter((t) => t.is_completed).length;
      const progress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
      await supabase.from("events").update({ progress }).eq("id", eventId!);
      try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
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
        event_id: eventId!,
        user_id: user!.id,
        name: budgetName.trim(),
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

  const deleteBudgetItem = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("budget_items").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget_items", eventId] }),
  });

  const togglePaid = useMutation({
    mutationFn: async ({ id, isPaid }: { id: string; isPaid: boolean }) => {
      await supabase.from("budget_items").update({ is_paid: isPaid }).eq("id", id);
      try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget_items", eventId] }),
  });

  const handleShare = async () => {
    try {
      await Share.share({
        title: event?.name || "My Event",
        text: `Check out my event: ${event?.name}`,
        dialogTitle: "Share Event",
      });
    } catch {}
  };

  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const confirmedGuests = guests.filter((g) => g.rsvp_status === "confirmed").length;
  const totalEstimated = budgetItems.reduce((s, i) => s + Number(i.estimated_cost || 0), 0);
  const totalActual = budgetItems.reduce((s, i) => s + Number(i.actual_cost || 0), 0);

  // Group budget by category for chart
  const budgetByCategory = budgetItems.reduce<Record<string, { estimated: number; actual: number }>>((acc, item) => {
    const cat = item.category || "General";
    if (!acc[cat]) acc[cat] = { estimated: 0, actual: 0 };
    acc[cat].estimated += Number(item.estimated_cost || 0);
    acc[cat].actual += Number(item.actual_cost || 0);
    return acc;
  }, {});

  const chartData = Object.entries(budgetByCategory).map(([name, values]) => ({ name, ...values }));

  // Group tasks by category
  const tasksByCategory = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    const cat = task.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-foreground">{event?.name || "Event"}</h1>
            <p className="text-xs text-muted-foreground capitalize">{event?.type}</p>
          </div>
          <button onClick={handleShare} className="p-2 hover:bg-secondary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {event?.date_start && (
            <span className="flex items-center gap-1.5 text-xs bg-secondary rounded-full px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {event.date_start}
            </span>
          )}
          {event?.location && (
            <span className="flex items-center gap-1.5 text-xs bg-secondary rounded-full px-3 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {event.location}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs bg-secondary rounded-full px-3 py-1.5">
            <Users className="w-3.5 h-3.5 text-muted-foreground" /> {event?.guest_count || 0} guests
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4 bg-secondary rounded-xl p-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                strokeDasharray={`${(event?.progress || 0) * 1.256} 125.6`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
              {event?.progress || 0}%
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{completedTasks}/{tasks.length} tasks</p>
            <p className="text-xs text-muted-foreground">{confirmedGuests} confirmed guests</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="px-5">
        <TabsList className="w-full bg-secondary mb-4">
          <TabsTrigger value="tasks" className="flex-1 gap-1.5 min-h-[44px]">
            <ClipboardList className="w-4 h-4" /> Tasks
          </TabsTrigger>
          <TabsTrigger value="guests" className="flex-1 gap-1.5 min-h-[44px]">
            <Users className="w-4 h-4" /> Guests
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex-1 gap-1.5 min-h-[44px]">
            <DollarSign className="w-4 h-4" /> Budget
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
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
                    <Checkbox
                      checked={task.is_completed ?? false}
                      onCheckedChange={(checked) => toggleTask.mutate({ taskId: task.id, completed: !!checked })}
                      className="mt-0.5"
                    />
                    <span className={`text-sm font-medium flex-1 ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Guests Tab */}
        <TabsContent value="guests">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{guests.length} guests • {confirmedGuests} confirmed</p>
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
                <span className={`text-xs px-2 py-1 rounded-full ${
                  guest.rsvp_status === "confirmed" ? "bg-secondary text-foreground" :
                  guest.rsvp_status === "declined" ? "bg-destructive/10 text-destructive" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {guest.rsvp_status || "pending"}
                </span>
              </div>
            ))}
            {guests.length > 10 && (
              <Button variant="ghost" className="w-full" onClick={() => navigate(`/events/${eventId}/guests`)}>
                View all {guests.length} guests
              </Button>
            )}
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Estimated</p>
              <p className="text-lg font-bold text-foreground">${totalEstimated.toLocaleString()}</p>
            </div>
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Actual</p>
              <p className={`text-lg font-bold ${totalActual > totalEstimated ? "text-destructive" : "text-foreground"}`}>
                ${totalActual.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Chart */}
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
              <div className="flex gap-4 mt-2 justify-center">
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm bg-border" /> Estimated
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm bg-foreground" /> Actual
                </span>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Items</h3>
            <Button size="sm" variant="outline" onClick={() => setShowBudgetForm(!showBudgetForm)}>
              {showBudgetForm ? "Cancel" : "+ Add"}
            </Button>
          </div>

          {showBudgetForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="bg-card border border-border rounded-xl p-4 space-y-3">
              <Input value={budgetName} onChange={(e) => setBudgetName(e.target.value)} placeholder="Item name" className="h-11 bg-secondary border-0" />
              <Input value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)} placeholder="Category (e.g. Venue)" className="h-11 bg-secondary border-0" />
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
                <Checkbox
                  checked={item.is_paid ?? false}
                  onCheckedChange={(checked) => togglePaid.mutate({ id: item.id, isPaid: !!checked })}
                />
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
