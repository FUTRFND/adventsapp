import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const TaskChecklist = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("id", eventId!).single();
      return data;
    },
    enabled: !!eventId,
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["event_tasks", eventId],
    queryFn: async () => {
      const { data } = await supabase
        .from("event_tasks")
        .select("*")
        .eq("event_id", eventId!)
        .order("sort_order", { ascending: true });
      return data || [];
    },
    enabled: !!eventId,
  });

  const toggleTask = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { error } = await supabase
        .from("event_tasks")
        .update({ is_completed: completed })
        .eq("id", taskId);
      if (error) throw error;

      // Recalculate progress
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, is_completed: completed } : t
      );
      const completedCount = updatedTasks.filter((t) => t.is_completed).length;
      const progress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;

      const { error: progressError } = await supabase
        .from("events")
        .update({ progress })
        .eq("id", eventId!);
      if (progressError) throw progressError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_tasks", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });

  const completedCount = tasks.filter((t) => t.is_completed).length;

  // Group tasks by category
  const grouped = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    const cat = task.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  return (
    <div className="pb-24 min-h-screen px-5 pt-14">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-foreground">{event?.name || "Tasks"}</h1>
          <p className="text-sm text-muted-foreground">
            {completedCount}/{tasks.length} tasks done
          </p>
        </div>
        <div className="relative w-14 h-14">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
              strokeDasharray={`${(event?.progress || 0) * 1.256} 125.6`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
            {event?.progress || 0}%
          </span>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading tasks...</p>}

      {!isLoading && tasks.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No tasks yet. Run the Planning Wizard to generate tasks.</p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, categoryTasks]) => (
          <motion.div key={category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{category}</h2>
            <div className="space-y-1">
              {categoryTasks.map((task) => (
                <label
                  key={task.id}
                  className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors"
                >
                  <Checkbox
                    checked={task.is_completed ?? false}
                    onCheckedChange={(checked) =>
                      toggleTask.mutate({ taskId: task.id, completed: !!checked })
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </span>
                    {task.description && (
                      <p className={`text-xs mt-0.5 ${task.is_completed ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TaskChecklist;
