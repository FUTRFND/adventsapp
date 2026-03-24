import { motion } from "framer-motion";
import { Wand2, PiggyBank, Users, Calendar, CheckSquare, Store } from "lucide-react";
import createEventMockup from "@/assets/mockups/create-event.png";

const features = [
  {
    icon: Wand2,
    title: "AI Planning Wizard",
    description: "Answer a few simple questions and get a complete event plan in minutes. Our AI understands your vision.",
  },
  {
    icon: PiggyBank,
    title: "Smart Budget Management",
    description: "Get intelligent budget breakdowns with real-time tracking. Stay on top of expenses easily.",
  },
  {
    icon: Store,
    title: "Vendor Marketplace",
    description: "Discover and compare vetted vendors matched to your style and budget.",
  },
  {
    icon: CheckSquare,
    title: "Dynamic Task Lists",
    description: "Never miss a deadline with auto-generated checklists organized by timeline.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite co-planners, delegate tasks, and keep everyone aligned seamlessly.",
  },
  {
    icon: Calendar,
    title: "Timeline Management",
    description: "Visual timeline from planning to event day. Sync with your calendar.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-semibold mb-4">
            Everything You Need to
            <br />
            <span className="text-gradient-metallic">Plan Perfectly</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful tools that take the stress out of event planning, so you
            can focus on creating memorable moments.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative max-w-xs sm:max-w-sm mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[2.5rem]" />
              <div className="relative rounded-[2rem] overflow-hidden shadow-elevated border border-border/50">
                <img
                  src={createEventMockup}
                  alt="Create event interface showing event details form"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 gradient-dark rounded-3xl -z-10 opacity-80" />
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-metallic-light rounded-2xl -z-10" />
            </div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <div className="grid sm:grid-cols-2 gap-5">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="group p-5 bg-card rounded-xl border border-border hover:shadow-card transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
