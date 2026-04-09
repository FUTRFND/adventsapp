import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, Calendar, MapPin, Users, DollarSign, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const EventSimulation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventData = location.state?.eventData;

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No event data found</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Celebration Header */}
      <div className="relative bg-gradient-to-b from-secondary to-background px-5 pt-16 pb-10 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-5">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="text-2xl font-display font-bold text-foreground mb-2">
          Your Event is Booked!
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-muted-foreground">
          Here's your projected event summary
        </motion.p>
      </div>

      <div className="px-5 space-y-5 -mt-2">
        {/* Event Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="h-40 bg-secondary flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-muted-foreground/20" />
          </div>
          <div className="p-5">
            <h2 className="text-xl font-display font-bold text-foreground mb-1">{eventData.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{eventData.type} • {eventData.theme}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{eventData.dateStart || "TBD"}</span>
              </div>
              {eventData.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground truncate">{eventData.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{eventData.guestCount} guests</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">${(eventData.totalPaid || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Selections Summary */}
        {eventData.selectedVenue && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Venue</h3>
            <p className="text-sm font-bold text-foreground">{eventData.selectedVenue.name}</p>
            {eventData.selectedVenue.location && (
              <p className="text-xs text-muted-foreground mt-0.5">{eventData.selectedVenue.location}</p>
            )}
          </motion.div>
        )}

        {(eventData.selectedVendors || []).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Vendors</h3>
            <div className="space-y-2">
              {eventData.selectedVendors.map((v: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="text-sm font-medium text-foreground">{v.name}</span>
                  <span className="text-xs text-muted-foreground">{v.category}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {(eventData.selectedDecor || []).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Decor & Style</h3>
            <div className="flex flex-wrap gap-2">
              {eventData.selectedDecor.map((d: any, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-secondary rounded-full text-xs font-medium text-foreground">{d.name}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Guest Coordination */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
          className="bg-secondary rounded-2xl p-5 text-center">
          <h3 className="text-sm font-bold text-foreground mb-1">Guest Coordination</h3>
          <p className="text-xs text-muted-foreground mb-3">Invite and manage your guest list seamlessly</p>
          <span className="inline-block px-4 py-2 bg-card border border-border rounded-full text-xs font-medium text-muted-foreground">
            Partiful integration coming soon
          </span>
        </motion.div>

        {/* Budget Summary */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Budget Summary</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Booked</span>
            <span className="text-lg font-bold text-foreground">${(eventData.totalPaid || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">Original Budget</span>
            <span className="text-sm text-muted-foreground">${(eventData.budget || 0).toLocaleString()}</span>
          </div>
        </motion.div>

        <Button className="w-full py-6 text-base font-semibold" onClick={() => navigate("/events")}>
          View My Events <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default EventSimulation;
