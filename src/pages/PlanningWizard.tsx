import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Planning Wizard",
    subtitle: "Let's start with the basics",
    fields: ["Event type", "Guest count", "Budget range"],
  },
  {
    title: "Tell us more about the vibe...",
    subtitle: "Select styles that resonate",
    tags: ["Modern", "Classic", "Rustic", "Elegant", "Bohemian", "Minimalist", "Tropical", "Vintage", "Glamorous", "Casual"],
  },
  {
    title: "Choose your priorities",
    subtitle: "What matters most to you?",
    priorities: ["Venue & Ambiance", "Food & Catering", "Photography", "Entertainment", "Decor & Florals", "Guest Experience"],
  },
  {
    title: "Almost there!",
    subtitle: "Review and generate your plan",
    summary: true,
  },
];

const PlanningWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Modern", "Elegant"]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(["Venue & Ambiance", "Food & Catering"]);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const togglePriority = (p: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(p) ? prev.filter((t) => t !== p) : [...prev, p]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate(-1)}
            className="text-foreground"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-sm text-muted-foreground flex-1 text-center pr-6">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">{step.title}</h2>
            <p className="text-muted-foreground mb-8">{step.subtitle}</p>

            {/* Step 1: Basics */}
            {currentStep === 0 && (
              <div className="space-y-4">
                {["Wedding", "150 guests", "$30,000 - $50,000"].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-secondary rounded-xl"
                  >
                    <span className="text-foreground font-medium">{item}</span>
                    <Check className="w-5 h-5 text-foreground" />
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Vibe tags */}
            {currentStep === 1 && step.tags && (
              <div className="flex flex-wrap gap-3">
                {step.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground border border-border"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Priorities */}
            {currentStep === 2 && step.priorities && (
              <div className="space-y-3">
                {step.priorities.map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePriority(p)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all ${
                      selectedPriorities.includes(p)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <span className="font-medium">{p}</span>
                    {selectedPriorities.includes(p) && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Summary */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-secondary rounded-xl p-5 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event</span>
                    <span className="font-medium text-foreground">Wedding</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium text-foreground">150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium text-foreground">$30,000 - $50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vibe</span>
                    <span className="font-medium text-foreground">{selectedTags.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priorities</span>
                    <span className="font-medium text-foreground text-right max-w-[60%]">
                      {selectedPriorities.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-8">
        <Button
          className="w-full py-6 text-base font-semibold"
          onClick={() => {
            if (currentStep < steps.length - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              navigate("/");
            }
          }}
        >
          {currentStep === steps.length - 1 ? "Generate My Plan" : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default PlanningWizard;
