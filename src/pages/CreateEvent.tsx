import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const tabs = ["Event", "Task", "Expense"];

const CreateEvent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Event");
  const [budget, setBudget] = useState([50000]);
  const [guestCount, setGuestCount] = useState("150");

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 px-5 pt-14 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="text-foreground">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-display font-bold text-foreground flex-1 text-center pr-6">
            Create Event
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-secondary rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 space-y-5"
      >
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Event Name</Label>
          <div className="relative">
            <Input
              defaultValue="Chloe & Ben's Wedding"
              className="h-12 bg-secondary border-0 text-foreground font-medium pr-10"
            />
            <Eye className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Type</Label>
          <Select defaultValue="wedding">
            <SelectTrigger className="h-12 bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wedding">Wedding</SelectItem>
              <SelectItem value="corporate">Corporate Event</SelectItem>
              <SelectItem value="birthday">Birthday Party</SelectItem>
              <SelectItem value="social">Social Gathering</SelectItem>
              <SelectItem value="graduation">Graduation</SelectItem>
              <SelectItem value="fundraiser">Fundraiser</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Date</Label>
          <div className="relative">
            <Input
              defaultValue="Dec 14, 2024 - Dec 15, 2024"
              className="h-12 bg-secondary border-0 text-foreground pr-10"
              readOnly
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Location</Label>
          <div className="relative">
            <Input
              defaultValue="Austin, TX, USA"
              className="h-12 bg-secondary border-0 text-foreground pr-10"
            />
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Guest Count</Label>
          <Input
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            type="number"
            className="h-12 bg-secondary border-0 text-foreground"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground">Budget</Label>
          </div>
          <Slider
            value={budget}
            onValueChange={setBudget}
            max={150000}
            min={1000}
            step={1000}
            className="mb-2"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              ${budget[0].toLocaleString()} USD
            </span>
            <span className="text-xs text-muted-foreground">$150</span>
          </div>
        </div>

        <Button
          className="w-full py-6 text-base font-semibold mt-4"
          onClick={() => navigate("/wizard")}
        >
          Generate Plan
        </Button>
      </motion.div>
    </div>
  );
};

export default CreateEvent;
