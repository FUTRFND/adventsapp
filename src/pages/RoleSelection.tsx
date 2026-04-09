import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Store, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const roles = [
  {
    type: "planner",
    icon: Calendar,
    title: "Plan an Event",
    description: "Create and plan personal or business events. Browse venues, vendors, and services.",
  },
  {
    type: "business",
    icon: Store,
    title: "List My Services",
    description: "Create a business profile and list your services for event planners to discover.",
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const selectRole = async (accountType: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ account_type: accountType } as any)
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to set account type");
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            How will you use Advents?
          </h1>
          <p className="text-muted-foreground">Choose your experience</p>
        </div>

        <div className="space-y-4">
          {roles.map((role, index) => (
            <motion.button
              key={role.type}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              onClick={() => selectRole(role.type)}
              className="w-full flex items-center gap-4 p-5 bg-card border border-border rounded-2xl text-left hover:border-foreground/20 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <role.icon className="w-7 h-7 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-foreground mb-0.5">{role.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{role.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
