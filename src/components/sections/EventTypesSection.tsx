import { motion } from "framer-motion";
import { Heart, Briefcase, Cake, PartyPopper, GraduationCap, Building2 } from "lucide-react";
import vendorMarketplaceMockup from "@/assets/mockups/vendor-marketplace.png";

const eventTypes = [
  { icon: Heart, name: "Weddings", description: "From intimate ceremonies to grand celebrations" },
  { icon: Briefcase, name: "Corporate Events", description: "Product launches, conferences & team offsites" },
  { icon: Cake, name: "Birthday Parties", description: "Milestone birthdays and kids' celebrations" },
  { icon: PartyPopper, name: "Social Gatherings", description: "Holiday parties, reunions & housewarmings" },
  { icon: GraduationCap, name: "Graduations", description: "Cap off achievements with memorable events" },
  { icon: Building2, name: "Fundraisers", description: "Galas, charity events & community drives" },
];

const EventTypesSection = () => {
  return (
    <section id="events" className="py-24 md:py-32 gradient-dark text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-5xl font-display font-semibold mb-4">
                Plan Any Occasion
              </h2>
              <p className="text-lg text-primary-foreground/70 max-w-lg">
                Whether it's a wedding for 200 or a birthday party for 20, Advents
                adapts to your needs with curated vendor recommendations.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
              {eventTypes.map((event, index) => (
                <motion.div
                  key={event.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="group p-5 bg-primary-foreground/5 rounded-xl border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <event.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold mb-1">{event.name}</h3>
                      <p className="text-sm text-primary-foreground/60">{event.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mt-12 lg:mt-0"
          >
            <div className="relative max-w-lg mx-auto">
              <div className="absolute -inset-4 bg-primary-foreground/5 rounded-3xl blur-xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary-foreground/10">
                <img
                  src={vendorMarketplaceMockup}
                  alt="Vendor marketplace showing venue selection and reviews"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary-foreground/10 rounded-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EventTypesSection;
