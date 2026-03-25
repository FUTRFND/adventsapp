import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, ChevronRight, Search, Mic, MapPin, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const eventTypes = [
  { value: "festival", label: "Festival" },
  { value: "art gala", label: "Art gala" },
  { value: "concert", label: "Concert" },
  { value: "baby shower", label: "Baby shower" },
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "birthday", label: "Birthday Party" },
  { value: "graduation", label: "Graduation" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "social", label: "Social Gathering" },
];

const themes = [
  { value: "Black and white", label: "Black and white" },
  { value: "Disco", label: "Disco" },
  { value: "Barbie", label: "Barbie" },
  { value: "Gatsby", label: "Gatsby" },
  { value: "Tropical", label: "Tropical" },
  { value: "Rustic", label: "Rustic" },
  { value: "Bohemian", label: "Bohemian" },
  { value: "Minimalist", label: "Minimalist" },
  { value: "Classic", label: "Classic" },
];

type SubPage = null | "type" | "theme" | "location";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState("wedding");
  const [theme, setTheme] = useState("Classic");
  const [dateStart, setDateStart] = useState("");
  const [location, setLocation] = useState("");
  const [guestCount, setGuestCount] = useState("150");
  const [budget, setBudget] = useState([50000]);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [subPage, setSubPage] = useState<SubPage>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;
    const ext = imageFile.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("event-images").upload(path, imageFile);
    if (error) { toast.error("Image upload failed"); return null; }
    const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Event name is required"); return; }
    setSaving(true);
    try {
      const imageUrl = await uploadImage();
      const { data, error } = await supabase.from("events").insert({
        user_id: user!.id,
        name: name.trim(),
        type,
        theme,
        date_start: dateStart || null,
        location: location || null,
        guest_count: parseInt(guestCount) || 0,
        budget: budget[0],
        description: description.trim() || null,
        image_url: imageUrl,
      } as any).select().single();
      if (error) throw error;
      toast.success("Event created!");
      navigate(`/wizard/${data.id}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedType = eventTypes.find((t) => t.value === type);
  const selectedTheme = themes.find((t) => t.value === theme);

  // Sub-page: Select Event Type
  if (subPage === "type") {
    const filtered = eventTypes.filter((t) =>
      !searchFilter || t.label.toLowerCase().includes(searchFilter.toLowerCase())
    );
    return (
      <div className="min-h-screen flex flex-col">
        <div className="px-5 pt-14 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => { setSubPage(null); setSearchFilter(""); }} className="text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-display font-bold text-foreground flex-1 text-center pr-6">Select an Event</h1>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search for event type" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} className="pl-11 pr-12 h-12 bg-secondary border-0 rounded-xl" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>
        <div className="flex-1 px-5">
          <div className="space-y-1">
            {filtered.map((t) => (
              <button
                key={t.value}
                onClick={() => { setType(t.value); setSubPage(null); setSearchFilter(""); }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all min-h-[44px] ${
                  type === t.value ? "bg-primary text-primary-foreground" : "bg-transparent text-foreground hover:bg-secondary"
                }`}
              >
                <span className="font-medium">{t.label}</span>
                {type === t.value && <div className="w-5 h-5 rounded-full border-2 border-primary-foreground flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" /></div>}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Textarea placeholder="Describe your event with keywords" className="bg-secondary border-0 min-h-[80px]" />
          </div>
        </div>
        <div className="px-5 pb-8 pt-4">
          <Button className="w-full py-6 text-base font-semibold" onClick={() => { setSubPage(null); setSearchFilter(""); }}>Save</Button>
        </div>
      </div>
    );
  }

  // Sub-page: Select Theme
  if (subPage === "theme") {
    const filtered = themes.filter((t) =>
      !searchFilter || t.label.toLowerCase().includes(searchFilter.toLowerCase())
    );
    return (
      <div className="min-h-screen flex flex-col">
        <div className="px-5 pt-14 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => { setSubPage(null); setSearchFilter(""); }} className="text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-display font-bold text-foreground flex-1 text-center pr-6">Select a Theme</h1>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search for event theme" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} className="pl-11 pr-12 h-12 bg-secondary border-0 rounded-xl" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>
        <div className="flex-1 px-5">
          <div className="space-y-1">
            {filtered.map((t) => (
              <button
                key={t.value}
                onClick={() => { setTheme(t.value); setSubPage(null); setSearchFilter(""); }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all min-h-[44px] ${
                  theme === t.value ? "bg-primary text-primary-foreground" : "bg-transparent text-foreground hover:bg-secondary"
                }`}
              >
                <span className="font-medium">{t.label}</span>
                {theme === t.value && <div className="w-5 h-5 rounded-full border-2 border-primary-foreground flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" /></div>}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Textarea placeholder="Add key tag words to describe the theme" className="bg-secondary border-0 min-h-[80px]" />
          </div>
        </div>
        <div className="px-5 pb-8 pt-4">
          <Button className="w-full py-6 text-base font-semibold" onClick={() => { setSubPage(null); setSearchFilter(""); }}>Save</Button>
        </div>
      </div>
    );
  }

  // Sub-page: Location
  if (subPage === "location") {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="px-5 pt-14 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setSubPage(null)} className="text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-display font-bold text-foreground flex-1 text-center pr-6">Location</h1>
          </div>
        </div>
        <div className="flex-1 px-5 space-y-4">
          <LocationAutocomplete value={location} onChange={setLocation} />
          <div className="w-full h-48 bg-secondary rounded-xl flex items-center justify-center border border-border">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Map will appear here</p>
            </div>
          </div>
        </div>
        <div className="px-5 pb-8 pt-4">
          <Button className="w-full py-6 text-base font-semibold" onClick={() => setSubPage(null)}>Save</Button>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-display font-bold text-foreground flex-1 text-center pr-6">Plan your event</h1>
        </div>
      </div>

      <div className="flex-1 px-5 space-y-5 overflow-y-auto">
        {/* Event image upload */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Event Image</Label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden h-44">
              <img src={imagePreview} alt="Event" className="w-full h-full object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-36 bg-secondary rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-muted-foreground transition-colors">
              <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Tap to add event image</span>
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>
          )}
        </div>

        {/* Event Title */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Event Title</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New year Art performance"
            className="h-auto py-3 bg-transparent border-0 border-b border-border rounded-none text-lg font-bold text-foreground placeholder:text-muted-foreground placeholder:font-normal placeholder:text-base focus-visible:ring-0"
          />
        </div>

        {/* Day picker */}
        <button
          onClick={() => {
            const input = document.createElement("input");
            input.type = "date";
            input.onchange = (e) => setDateStart((e.target as HTMLInputElement).value);
            input.click();
          }}
          className="w-full flex items-center gap-4 bg-secondary rounded-xl px-4 py-4 text-left min-h-[44px]"
        >
          <div className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Day</p>
            <p className="text-xs text-muted-foreground">
              {dateStart ? new Date(dateStart + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : "Select a date"}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Time picker */}
        <button className="w-full flex items-center gap-4 bg-secondary rounded-xl px-4 py-4 text-left min-h-[44px]">
          <div className="w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Choose Time</p>
            <p className="text-xs text-muted-foreground">Set event time</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Event type selector */}
        <div>
          <Label className="text-sm font-semibold text-foreground mb-2 block">Event type</Label>
          <button onClick={() => setSubPage("type")} className="w-full flex items-center gap-3 bg-secondary rounded-xl px-4 py-3.5 text-left min-h-[44px]">
            <span className="flex-1 text-sm font-medium text-foreground">{selectedType?.label || "Select type"}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Event theme selector */}
        <div>
          <Label className="text-sm font-semibold text-foreground mb-2 block">Event theme</Label>
          <button onClick={() => setSubPage("theme")} className="w-full flex items-center gap-3 bg-secondary rounded-xl px-4 py-3.5 text-left min-h-[44px]">
            <span className="flex-1 text-sm font-medium text-foreground">{selectedTheme?.label || "Select theme"}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Location selector */}
        <div>
          <Label className="text-sm font-semibold text-foreground mb-2 block">Location</Label>
          <button onClick={() => setSubPage("location")} className="w-full flex items-center gap-3 bg-secondary rounded-xl px-4 py-3.5 text-left min-h-[44px]">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium text-foreground">{location || "Select location"}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Guest count */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Guest Count</Label>
          <Input value={guestCount} onChange={(e) => setGuestCount(e.target.value)} type="number" className="h-12 bg-secondary border-0 text-foreground" />
        </div>

        {/* Budget */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Budget</Label>
          <Slider value={budget} onValueChange={setBudget} max={150000} min={1000} step={1000} className="mb-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">${budget[0].toLocaleString()} USD</span>
            <span className="text-xs text-muted-foreground">$150,000</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 pt-4">
        <Button className="w-full py-6 text-base font-semibold" onClick={handleCreate} disabled={saving}>
          {saving ? "Creating..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default CreateEvent;
