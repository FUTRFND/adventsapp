import { motion } from "framer-motion";
import planningWizardMockup from "@/assets/mockups/planning-wizard.png";

const steps = [
  {
    number: "01",
    title: "Tell Us About Your Event",
    description: "Select your event type, set your guest count and budget. Share your style preferences with tags like 'Modern', 'Casual', or 'Elegant'.",
  },
  {
    number: "02",
    title: "Get Your AI-Generated Plan",
    description: "In under a minute, receive a complete event plan with budget breakdowns, a personalized task list, and curated vendor recommendations.",
  },
  {
    number: "03",
    title: "Execute & Celebrate",
    description: "Use your dashboard to manage tasks, track spending, connect with vendors, and collaborate with your team. Then enjoy your perfect event!",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-semibold mb-4">
            Plan Any Event in
            <br />
            <span className="text-gradient-metallic">Three Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From idea to celebration, we've streamlined every step of the planning process.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative flex gap-6 mb-12 last:mb-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 gradient-dark rounded-2xl flex items-center justify-center">
                    <span className="text-xl md:text-2xl font-display font-bold text-primary-foreground">
                      {step.number}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-16 bg-border mx-auto mt-3" />
                  )}
                </div>
                <div className="pt-1">
                  <h3 className="text-xl md:text-2xl font-semibold mb-2 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mt-12 lg:mt-0"
          >
            <div className="relative max-w-lg mx-auto">
              <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-br from-secondary via-background to-secondary rounded-3xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                <img
                  src={planningWizardMockup}
                  alt="Multi-step planning wizard interface showing event creation flow"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -top-4 -left-4 w-20 h-20 gradient-dark rounded-2xl -z-10" />
              <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-metallic-light rounded-3xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
