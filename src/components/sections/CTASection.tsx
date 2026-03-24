import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import profileMockup from "@/assets/mockups/profile-screen.png";

const CTASection = () => {
  return (
    <section className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative max-w-xs sm:max-w-sm mx-auto">
              <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-br from-metallic-light via-secondary to-metallic-light rounded-[3rem] opacity-60" />
              <div className="relative rounded-[2rem] overflow-hidden shadow-elevated border border-border/30">
                <img
                  src={profileMockup}
                  alt="User profile showing events and account management"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-24 h-24 gradient-dark rounded-2xl -z-10" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-metallic-mid rounded-xl -z-10" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left order-1 lg:order-2"
          >
            <div className="w-20 h-1 gradient-metallic rounded-full mb-8 mx-auto lg:mx-0" />
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-semibold mb-6">
              Ready to Plan Your
              <br />
              <span className="text-gradient-metallic">Perfect Event?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10">
              Join thousands of planners who've discovered a smarter way to create
              memorable events. Start free today.
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Button size="lg" className="group px-10 py-7 text-lg">
                Start Planning Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Free forever for basic features
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
