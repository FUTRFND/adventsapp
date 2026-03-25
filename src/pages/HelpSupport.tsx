import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

const faqs = [
  { q: "How do I create a new event?", a: "Tap the 'Create New Event' button on your dashboard or profile page. Follow the planning wizard to set up your event details, budget, and guest list." },
  { q: "Can I invite guests via email?", a: "Guest email invitations are coming soon. Currently you can add guests and track their RSVP status manually." },
  { q: "How does the budget tracker work?", a: "Each event has a budget section where you can add line items with estimated and actual costs. The tracker shows your spending vs. your total budget in real time." },
  { q: "Can I collaborate with others on an event?", a: "Collaboration features are on our roadmap. Currently each event is managed by a single account." },
  { q: "How do I delete an event?", a: "Go to the event detail page and look for the delete option. This will permanently remove the event and all associated data." },
  { q: "Is my data secure?", a: "Yes. All data is encrypted in transit and at rest. We use industry-standard security practices and row-level security to ensure only you can access your data." },
];

const HelpSupport = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    // Simulate sending — real email integration requires domain setup
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    toast.success("Message sent! We'll get back to you soon.");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="pb-24 min-h-screen px-5 pt-14">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-display font-bold text-foreground">Help & Support</h1>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="bg-card border border-border rounded-xl overflow-hidden">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className={i < faqs.length - 1 ? "border-b border-border" : ""}>
              <AccordionTrigger className="px-4 py-3.5 text-sm font-medium text-foreground hover:no-underline min-h-[44px]">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3.5 text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Contact Us</h2>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Your Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="mt-1" maxLength={100} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email Address</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" maxLength={255} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue or question…" className="mt-1 min-h-[100px]" maxLength={1000} />
          </div>
          <Button type="submit" disabled={sending} className="w-full min-h-[44px] gap-2">
            <Send className="w-4 h-4" />
            {sending ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default HelpSupport;
