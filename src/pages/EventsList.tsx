import { motion } from "framer-motion";
import { Calendar, ChevronRight } from "lucide-react";

const events = [
  { name: "Wedding", date: "Dec 31", people: "10,221", progress: 75, subtitle: "Wedding Celebration", status: "active" },
  { name: "Q4 Product Launch", date: "Dec 31", people: "2,321", progress: 40, subtitle: "Corporate Event", status: "active" },
  { name: "New Year's Eve Party", date: "Jan 1", people: "350", progress: 20, subtitle: "Social Gathering", status: "upcoming" },
  { name: "Summer BBQ", date: "Jun 15", people: "80", progress: 0, subtitle: "Casual Event", status: "draft" },
];

const EventsList = () => {
  return (
    <div className="pb-24 min-h-screen px-5 pt-14">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">My Events</h1>

      <div className="space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={event.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{event.name}</span>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{event.subtitle}</p>
                <p className="text-xs text-muted-foreground ml-6 mt-1">{event.people} people • {event.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                    <circle
                      cx="24" cy="24" r="20"
                      fill="none"
                      stroke="hsl(var(--foreground))"
                      strokeWidth="3"
                      strokeDasharray={`${event.progress * 1.256} 125.6`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
                    {event.progress}%
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventsList;
