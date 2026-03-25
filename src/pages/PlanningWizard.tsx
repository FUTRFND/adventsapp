import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const vibeOptions = ["Modern", "Classic", "Rustic", "Elegant", "Bohemian", "Minimalist", "Tropical", "Vintage", "Glamorous", "Casual"];
const priorityOptions = ["Venue & Ambiance", "Food & Catering", "Photography", "Entertainment", "Decor & Florals", "Guest Experience"];

const taskTemplates: Record<string, { title: string; category: string }[]> = {
  "Venue & Ambiance": [
    { title: "Research and shortlist venues", category: "Venue" },
    { title: "Schedule venue tours", category: "Venue" },
    { title: "Book venue and sign contract", category: "Venue" },
  ],
  "Food & Catering": [
    { title: "Research caterers", category: "Catering" },
    { title: "Schedule tastings", category: "Catering" },
    { title: "Finalize menu selections", category: "Catering" },
  ],
  "Photography": [
    { title: "Review photographer portfolios", category: "Photography" },
    { title: "Book photographer", category: "Photography" },
    { title: "Create shot list", category: "Photography" },
  ],
  "Entertainment": [
    { title: "Research entertainment options", category: "Entertainment" },
    { title: "Book DJ or live band", category: "Entertainment" },
    { title: "Plan playlist and special songs", category: "Entertainment" },
  ],
  "Decor & Florals": [
    { title: "Define color scheme and theme", category: "Decor" },
    { title: "Meet with florist", category: "Decor" },
    { title: "Order centerpieces and arrangements", category: "Decor" },
  ],
  "Guest Experience": [
    { title: "Create guest list", category: "Guests" },
    { title: "Design and send invitations", category: "Guests" },
    { title: "Plan welcome gifts or favors", category: "Guests" },
  ],
};

const PlanningWizard = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const { data } = await supabase.from("events").select("*").eq("id", eventId).single();
      return data;
    },
    enabled: !!eventId,
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const { data } = await supabase.from("vendors").select("*").order("rating", { ascending: false });
      return data || [];
    },
  });

  const steps = [
    { title: "Planning Wizard", subtitle: "Let's start with the basics" },
    { title: "Tell us about the vibe...", subtitle: "Select styles that resonate" },
    { title: "Choose your priorities", subtitle: "What matters most to you?" },
    { title: "Vendors", subtitle: "Select all desired vendors" },
    { title: "Almost there!", subtitle: "Review and generate your plan" },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const toggleVendor = (id: string) => {
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const generatePlan = async () => {
    if (!eventId || !user) return;
    setGenerating(true);

    try {
      await supabase.from("events").update({
        vibe_tags: selectedTags,
        priorities: selectedPriorities,
      }).eq("id", eventId);

      // Save selected vendors
      if (selectedVendorIds.length > 0) {
        const saves = selectedVendorIds.map((vendor_id) => ({ user_id: user.id, vendor_id }));
        await supabase.from("saved_vendors").upsert(saves, { onConflict: "user_id,vendor_id" });
      }

      const tasks = selectedPriorities.flatMap((priority, pi) => {
        const templates = taskTemplates[priority] || [];
        return templates.map((t, ti) => ({
          event_id: eventId, user_id: user.id, title: t.title, category: t.category, sort_order: pi * 10 + ti,
        }));
      });
      tasks.push(
        { event_id: eventId, user_id: user.id, title: "Set final budget breakdown", category: "Planning", sort_order: 100 },
        { event_id: eventId, user_id: user.id, title: "Create day-of timeline", category: "Planning", sort_order: 101 },
        { event_id: eventId, user_id: user.id, title: "Confirm all vendor contracts", category: "Planning", sort_order: 102 },
      );

      if (tasks.length > 0) {
        const { error } = await supabase.from("event_tasks").insert(tasks);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["saved_vendors"] });
      toast.success("Your plan has been generated!");
      navigate("/events");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate(-1)} className="text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-sm text-muted-foreground flex-1 text-center pr-6">Step {currentStep + 1} of {steps.length}</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      <div className="flex-1 px-5 pb-8">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground mb-8">{steps[currentStep].subtitle}</p>

            {/* Step 0: Overview */}
            {currentStep === 0 && event && (
              <div className="space-y-4">
                {[
                  { label: "Event", value: event.name },
                  { label: "Type", value: event.type },
                  { label: "Guests", value: `${event.guest_count}` },
                  { label: "Budget", value: `$${Number(event.budget).toLocaleString()}` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
            {currentStep === 0 && !event && (
              <p className="text-muted-foreground">No event selected. <button onClick={() => navigate("/create")} className="underline text-foreground">Create one first</button>.</p>
            )}

            {/* Step 1: Vibes */}
            {currentStep === 1 && (
              <div className="flex flex-wrap gap-3">
                {vibeOptions.map((tag) => (
                  <button key={tag} onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground border border-border"}`}>
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Priorities */}
            {currentStep === 2 && (
              <div className="space-y-3">
                {priorityOptions.map((p) => (
                  <button key={p} onClick={() => setSelectedPriorities(prev => prev.includes(p) ? prev.filter(t => t !== p) : [...prev, p])}
                    className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all ${selectedPriorities.includes(p) ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    <span className="font-medium">{p}</span>
                    {selectedPriorities.includes(p) && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Vendor Selection Grid */}
            {currentStep === 3 && (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {vendors.map((vendor) => {
                    const isSelected = selectedVendorIds.includes(vendor.id);
                    return (
                      <button
                        key={vendor.id}
                        onClick={() => toggleVendor(vendor.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                          isSelected ? "ring-2 ring-primary bg-secondary" : "bg-transparent"
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 flex items-center justify-center ${
                          isSelected ? "border-primary" : "border-border"
                        }`}>
                          {vendor.image_url ? (
                            <img src={vendor.image_url} alt={vendor.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-muted-foreground">{vendor.name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-foreground text-center leading-tight line-clamp-2">{vendor.name}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>These vendors appear based on the information entered for your event</p>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="bg-secondary rounded-xl p-5 space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Event</span><span className="font-medium text-foreground">{event?.name || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Guests</span><span className="font-medium text-foreground">{event?.guest_count || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span className="font-medium text-foreground">${Number(event?.budget || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Vibe</span><span className="font-medium text-foreground text-right max-w-[60%]">{selectedTags.join(", ") || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Priorities</span><span className="font-medium text-foreground text-right max-w-[60%]">{selectedPriorities.join(", ") || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Vendors</span><span className="font-medium text-foreground">{selectedVendorIds.length} selected</span></div>
                <p className="text-xs text-muted-foreground mt-3">This will generate {selectedPriorities.length * 3 + 3} tasks for your event plan.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-5 pb-8">
        <Button className="w-full py-6 text-base font-semibold" disabled={generating}
          onClick={() => {
            if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
            else generatePlan();
          }}>
          {currentStep === steps.length - 1 ? (generating ? "Generating..." : "Generate My Plan") : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default PlanningWizard;
