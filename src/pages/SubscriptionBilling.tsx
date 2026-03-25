import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    icon: Zap,
    features: ["1 active event", "Up to 25 guests", "Basic task checklist", "Community vendor directory"],
    current: true,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    icon: Sparkles,
    features: ["5 active events", "Up to 200 guests", "AI planning assistant", "Budget tracking & reports", "Priority support"],
    popular: true,
  },
  {
    name: "Premium",
    price: "$24.99",
    period: "/month",
    icon: Crown,
    features: ["Unlimited events", "Unlimited guests", "AI planning + vendor matching", "Full analytics dashboard", "Dedicated account manager", "Custom branding"],
  },
];

const SubscriptionBilling = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-24 min-h-screen px-5 pt-14">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-display font-bold text-foreground">Subscription & Billing</h1>
      </div>

      <div className="space-y-4">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative bg-card border rounded-xl p-5 ${plan.popular ? "border-foreground ring-1 ring-foreground" : "border-border"}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2.5 left-4 bg-foreground text-background text-xs">Most Popular</Badge>
            )}
            {plan.current && (
              <Badge variant="secondary" className="absolute -top-2.5 left-4 text-xs">Current Plan</Badge>
            )}
            <div className="flex items-start justify-between mb-4 mt-1">
              <div>
                <div className="flex items-center gap-2">
                  <plan.icon className="w-5 h-5 text-foreground" />
                  <h3 className="text-lg font-display font-bold text-foreground">{plan.name}</h3>
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                </p>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-foreground flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.current ? "secondary" : plan.popular ? "default" : "outline"}
              className="w-full min-h-[44px]"
              disabled={plan.current}
            >
              {plan.current ? "Current Plan" : "Upgrade"}
            </Button>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Plans are for display purposes. Payment processing coming soon.
      </p>
    </div>
  );
};

export default SubscriptionBilling;
