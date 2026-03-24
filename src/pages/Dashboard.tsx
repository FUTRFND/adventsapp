import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Wand2, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const upcomingEvent = {
  name: "New Year's Eve Party",
  date: "23 days",
  collaborators: 5,
};

const currentEvents = [
  { name: "Wedding", date: "Dec 31", people: "10,221", progress: 75, subtitle: "Wedding Celebration" },
  { name: "Q4 Product Launch", date: "Dec 31", people: "2,321", progress: 40, subtitle: "Corporate Event" },
];

const quickEvents = [
  { name: "New Year's Party", icon: "🎉" },
  { name: "Project Launch", icon: "🚀" },
  { name: "Summer BBQ", icon: "☀️" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-24 px-5 pt-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Hi, Sarah!</h1>
          <p className="text-sm text-muted-foreground">Welcome back, ready to plan?</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-metallic-mid overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>

      {/* Upcoming Event Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-secondary rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Upcoming event</span>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-foreground" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{upcomingEvent.name}</h3>
            <p className="text-sm text-muted-foreground">{upcomingEvent.date}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex -space-x-2 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-metallic-mid border-2 border-background overflow-hidden">
              <img
                src={`https://i.pravatar.cc/32?img=${i + 10}`}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground">+5</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <Button
          onClick={() => navigate("/wizard")}
          className="w-full py-6 text-base font-semibold mb-3"
        >
          <Wand2 className="w-5 h-5 mr-2" />
          AI Planning Wizard
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/create")}
          className="w-full py-6 text-base font-semibold"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Start from scratch
        </Button>
      </motion.div>

      {/* Your Events */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-sm font-semibold text-foreground mb-3">Your events</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {quickEvents.map((event) => (
            <button
              key={event.name}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl w-28 hover:shadow-soft transition-shadow"
            >
              <span className="text-2xl">{event.icon}</span>
              <span className="text-xs font-medium text-foreground text-center leading-tight">{event.name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Current Events */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-sm font-semibold text-foreground mb-3">Current events</h2>
        <div className="space-y-3">
          {currentEvents.map((event) => (
            <div
              key={event.name}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{event.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">{event.people} people</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted-foreground">{event.date}</span>
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
                </div>
              </div>
              <p className="text-xs text-muted-foreground ml-6">{event.subtitle}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
