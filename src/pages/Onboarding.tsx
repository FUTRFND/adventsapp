import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Sparkles, ArrowRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const slides: { icon: LucideIcon | null; title: string; description: string }[] = [
  {
    icon: null,
    title: "Welcome to Advents",
    description: "Your all-in-one event planning marketplace. Plan weddings, parties, corporate events, and more — effortlessly.",
  },
  {
    icon: CheckCircle2,
    title: "Plan Smarter",
    description: "Guided wizards, budget tracking, decor inspiration, and a curated vendor marketplace — all in one place.",
  },
  {
    icon: Sparkles,
    title: "Let's Get Started",
    description: "Create your first event, browse public events for inspiration, or list your services as a vendor.",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const finish = () => {
    localStorage.setItem("advents_onboarded", "true");
    navigate("/auth", { replace: true });
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-12">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {slides[current].icon ? (
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-8">
                {(() => {
                  const Icon = slides[current].icon!;
                  return <Icon className="w-10 h-10 text-foreground" />;
                })()}
              </div>
            ) : (
              <div className="mb-8 flex justify-center">
                <Logo size="xl" showMark showWordmark={false} />
              </div>
            )}
            <h1 className="text-3xl font-display font-bold text-foreground mb-4">
              {slides[current].title}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {slides[current].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-foreground" : "w-2 bg-border"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-sm">
        {current < slides.length - 1 ? (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 py-6" onClick={finish}>
              Skip
            </Button>
            <Button className="flex-1 py-6" onClick={() => setCurrent(current + 1)}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <Button className="w-full py-6 text-base font-semibold" onClick={finish}>
            Get Started
          </Button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
