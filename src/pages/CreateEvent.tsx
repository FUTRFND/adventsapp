import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Check, Calendar, Clock, MapPin, Users, DollarSign, ChevronRight, ImagePlus, X, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { eventTypes, eventTypeCategories } from "@/data/eventTypes";
import { eventThemes } from "@/data/eventThemes";
import { Globe, Lock } from "lucide-react";
import EventVisualization from "./EventVisualization";

const TOTAL_STEPS = 10;


const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [theme, setTheme] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [guestCount, setGuestCount] = useState("100");
  const [budget, setBudget] = useState([30000]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Selection state
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [selectedVendors, setSelectedVendors] = useState<any[]>([]);
  const [selectedDecor, setSelectedDecor] = useState<any[]>([]);
  const [selectedInspiration, setSelectedInspiration] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [selectedPlanner, setSelectedPlanner] = useState<any>(null);

  // Search
  const [searchFilter, setSearchFilter] = useState("");
  const [typeCategory, setTypeCategory] = useState("All");

  const { data: venues = [] } = useQuery({
    queryKey: ["vendors-venues"],
    queryFn: async () => {
      const { data } = await supabase.from("vendors").select("*").eq("category", "Venues").order("rating", { ascending: false });
      return (data || []).map(v => ({ ...v, price: parseInt(v.price_range?.replace(/[^0-9]/g, '') || '5000') }));
    },
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors-services"],
    queryFn: async () => {
      const { data } = await supabase.from("vendors").select("*").neq("category", "Venues").order("rating", { ascending: false });
      return (data || []).map(v => ({ ...v, price: parseInt(v.price_range?.replace(/[^0-9]/g, '') || '2000') }));
    },
  });

  const { data: planners = [] } = useQuery({
    queryKey: ["vendors-planners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vendors")
        .select("*")
        .or("category.eq.Planning,category.eq.Planner,category.ilike.%planner%")
        .order("rating", { ascending: false });
      return data || [];
    },
  });

  const { data: inspirationBoards = [] } = useQuery({
    queryKey: ["decor_inspiration"],
    queryFn: async () => {
      const { data } = await supabase.from("decor_inspiration").select("*").limit(24);
      return data || [];
    },
  });

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const filteredTypes = useMemo(() => {
    let list = eventTypes;
    if (typeCategory !== "All") list = list.filter(t => t.category === typeCategory);
    if (searchFilter) list = list.filter(t => t.label.toLowerCase().includes(searchFilter.toLowerCase()));
    return list;
  }, [typeCategory, searchFilter]);

  const filteredThemes = useMemo(() => {
    if (!searchFilter) return eventThemes;
    return eventThemes.filter(t => t.label.toLowerCase().includes(searchFilter.toLowerCase()));
  }, [searchFilter]);

  const runningTotal = useMemo(() => {
    const v = selectedVenue?.price || 0;
    const vd = selectedVendors.reduce((s, x) => s + (x.price || 0), 0);
    const dc = selectedDecor.reduce((s, x) => s + (x.price || 0), 0);
    return v + vd + dc;
  }, [selectedVenue, selectedVendors, selectedDecor]);

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
    if (error) return null;
    const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleNext = () => {
    if (step === 0 && !type) { toast.error("Please select an event type"); return; }
    if (step === 1 && !theme) { toast.error("Please select a theme"); return; }
    if (step === 3 && !name.trim()) { toast.error("Please enter an event name"); return; }
    if (step === 3 && startTime && endTime && endTime <= startTime) { toast.error("End time must be after start time"); return; }
    setSearchFilter("");
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) { setSearchFilter(""); setStep(step - 1); }
    else navigate(-1);
  };

  const handleFinish = async () => {
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
        image_url: imageUrl,
        visibility,
        planner_id: selectedPlanner?.id || null,
      } as any).select().single();
      if (error) throw error;

      // Navigate to payment with all selections
      navigate("/payment", {
        state: {
          eventData: {
            id: data.id,
            name: name.trim(),
            type: eventTypes.find(t => t.value === type)?.label || type,
            theme: eventThemes.find(t => t.value === theme)?.label || theme,
            dateStart: dateStart ? new Date(dateStart + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" }) : null,
            startTime,
            endTime,
            location,
            guestCount: parseInt(guestCount) || 0,
            budget: budget[0],
            selectedVenue,
            selectedVendors,
            selectedDecor,
            visibility,
            selectedPlanner,
            inspirationBoardIds: selectedInspiration,
          },
        },
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleVendor = (vendor: any) => {
    setSelectedVendors(prev =>
      prev.find(v => v.id === vendor.id) ? prev.filter(v => v.id !== vendor.id) : [...prev, vendor]
    );
  };

  const toggleDecor = (decor: any) => {
    setSelectedDecor(prev =>
      prev.find(d => d.id === decor.id) ? prev.filter(d => d.id !== decor.id) : [...prev, decor]
    );
  };

  const stepTitles = [
    "What are you planning?",
    "Choose your theme",
    "Find your inspiration",
    "Event details",
    "Select a venue",
    "Choose vendors",
    "Decor & style",
    "Visibility & planner",
    "", // step 8 = visualization (no header)
    "Review your event",
  ];

  const selectedDecorBoards = inspirationBoards
    .filter((b: any) => selectedInspiration.includes(b.id))
    .map((b: any) => ({ id: b.id, title: b.title, cover_url: b.cover_url, style_category: b.style_category }));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-3">
        <div className="flex items-center gap-4 mb-3">
          <button onClick={handleBack} className="text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-sm text-muted-foreground flex-1 text-center pr-6">Step {step + 1} of {TOTAL_STEPS}</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>
        {/* Running Total */}
        {runningTotal > 0 && step >= 4 && (
          <div className="mt-2 flex justify-end">
            <span className="text-xs text-muted-foreground">Est. total: <span className="font-semibold text-foreground">${runningTotal.toLocaleString()}</span></span>
          </div>
        )}
      </div>

      <div className="flex-1 px-5 pb-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {step < stepTitles.length && (
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">{stepTitles[step]}</h2>
            )}

            {/* Step 0: Event Type */}
            {step === 0 && (
              <div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search event types..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
                    className="pl-10 h-11 bg-secondary border-0 rounded-xl" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
                  {eventTypeCategories.map(cat => (
                    <button key={cat} onClick={() => setTypeCategory(cat)}
                      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${typeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="space-y-1 mt-2">
                  {filteredTypes.map(t => (
                    <button key={t.value} onClick={() => setType(t.value)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${type === t.value ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}>
                      <span className="font-medium text-sm">{t.label}</span>
                      {type === t.value && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Theme */}
            {step === 1 && (
              <div>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search themes..." value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
                    className="pl-10 h-11 bg-secondary border-0 rounded-xl" />
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {filteredThemes.map(t => (
                    <button key={t.value} onClick={() => setTheme(t.value)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${theme === t.value ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground border border-border"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Inspiration */}
            {step === 2 && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">Pick decor boards that match your vision. We'll use them to shape your visualization.</p>
                {inspirationBoards.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">No inspiration boards yet — you can skip this step.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {inspirationBoards.map((b: any) => {
                      const active = selectedInspiration.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          onClick={() => setSelectedInspiration(prev => prev.includes(b.id) ? prev.filter(x => x !== b.id) : [...prev, b.id])}
                          className={`relative rounded-xl overflow-hidden aspect-[3/4] text-left transition-all ${active ? "ring-2 ring-primary" : ""}`}
                        >
                          {b.cover_url && <img src={b.cover_url} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-semibold leading-tight">{b.title}</p>
                            {b.style_category && <p className="text-white/70 text-[10px]">{b.style_category}</p>}
                          </div>
                          {active && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-primary-foreground" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Event Image */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Event Image (optional)</Label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden h-36">
                      <img src={imagePreview} alt="Event" className="w-full h-full object-cover" />
                      <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full">
                        <X className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-28 bg-secondary rounded-xl border-2 border-dashed border-border cursor-pointer">
                      <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Add image</span>
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </label>
                  )}
                </div>
                {/* Name */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Event Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="My Amazing Event"
                    className="h-12 bg-secondary border-0 text-foreground text-base" />
                </div>
                {/* Date */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Date</Label>
                  <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="h-12 bg-secondary border-0 text-foreground" />
                </div>
                {/* Times */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Start Time</Label>
                    <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                      className="h-12 bg-secondary border-0 text-foreground" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">End Time</Label>
                    <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                      className="h-12 bg-secondary border-0 text-foreground" />
                  </div>
                </div>
                {startTime && endTime && endTime <= startTime && (
                  <p className="text-xs text-destructive">End time must be after start time</p>
                )}
                {/* Location */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Location</Label>
                  <LocationAutocomplete value={location} onChange={setLocation} />
                </div>
                {/* Guest Count */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Expected Guests</Label>
                  <Input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)}
                    className="h-12 bg-secondary border-0 text-foreground" />
                </div>
                {/* Budget */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Budget</Label>
                  <Slider value={budget} onValueChange={setBudget} max={200000} min={1000} step={1000} className="mb-2" />
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-foreground">${budget[0].toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">$200,000</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Venue Selection */}
            {step === 4 && (
              <div className="space-y-3">
                {venues.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No venues available yet</p>
                    <p className="text-xs mt-1">You can skip this step</p>
                  </div>
                ) : venues.map(venue => (
                  <button key={venue.id} onClick={() => setSelectedVenue(selectedVenue?.id === venue.id ? null : venue)}
                    className={`w-full bg-card border rounded-xl overflow-hidden text-left transition-all ${selectedVenue?.id === venue.id ? "border-foreground ring-1 ring-foreground" : "border-border"}`}>
                    {venue.image_url && <img src={venue.image_url} alt={venue.name} className="w-full h-32 object-cover" />}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{venue.name}</h3>
                          {venue.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{venue.location}</p>}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-foreground">{venue.price_range}</span>
                          {venue.rating && (
                            <p className="text-xs text-muted-foreground flex items-center gap-0.5 justify-end mt-0.5">
                              <Star className="w-3 h-3 fill-foreground text-foreground" />{venue.rating}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 5: Vendor Selection */}
            {step === 5 && (
              <div className="space-y-3">
                {vendors.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No vendors available yet</p>
                  </div>
                ) : vendors.map(vendor => {
                  const isSelected = selectedVendors.some(v => v.id === vendor.id);
                  return (
                    <button key={vendor.id} onClick={() => toggleVendor(vendor)}
                      className={`w-full bg-card border rounded-xl overflow-hidden text-left transition-all ${isSelected ? "border-foreground ring-1 ring-foreground" : "border-border"}`}>
                      <div className="flex gap-3 p-4">
                        {vendor.image_url && <img src={vendor.image_url} alt={vendor.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-foreground">{vendor.name}</h3>
                          <p className="text-xs text-muted-foreground">{vendor.category}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground">{vendor.price_range}</span>
                            {vendor.rating && (
                              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-foreground text-foreground" />{vendor.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-foreground flex-shrink-0 mt-1" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 6: Decor & Style — Pinterest-style inspiration board */}
            {step === 6 && (
              <DecorInspirationGallery
                boards={inspirationBoards}
                theme={theme}
                eventType={type}
                selected={selectedDecor}
                onToggle={(item: any) => toggleDecor(item)}
              />
            )}

            {/* Step 7: Visibility & Planner */}
            {step === 7 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Who can see this event?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setVisibility("private")}
                      className={`p-4 rounded-xl border text-left transition-all ${visibility === "private" ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                    >
                      <Lock className="w-5 h-5 text-foreground mb-2" />
                      <p className="text-sm font-semibold text-foreground">Private</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Only you and invited guests</p>
                    </button>
                    <button
                      onClick={() => setVisibility("public")}
                      className={`p-4 rounded-xl border text-left transition-all ${visibility === "public" ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                    >
                      <Globe className="w-5 h-5 text-foreground mb-2" />
                      <p className="text-sm font-semibold text-foreground">Public</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Featured in the Explore feed</p>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Add a planner (optional)</h3>
                  <p className="text-xs text-muted-foreground mb-3">Hand off coordination to a professional from the marketplace.</p>
                  {planners.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No planners available yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {planners.map((p: any) => {
                        const active = selectedPlanner?.id === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setSelectedPlanner(active ? null : p)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${active ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                          >
                            {p.image_url && <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{p.price_range}</p>
                            </div>
                            {active && <Check className="w-5 h-5 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 8: Event Visualization mood board */}
            {step === 8 && (
              <div className="-mx-5">
                <EventVisualization
                  data={{
                    eventName: name,
                    type: eventTypes.find(t => t.value === type)?.label,
                    theme: eventThemes.find(t => t.value === theme)?.label,
                    location,
                    guestCount: parseInt(guestCount) || 0,
                    selectedVenue,
                    selectedVendors,
                    selectedDecorBoards,
                  }}
                  onConfirm={() => setStep(9)}
                  onBack={() => setStep(7)}
                />
              </div>
            )}

            {/* Step 9: Review */}
            {step === 9 && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Event</span><span className="text-sm font-medium text-foreground text-right max-w-[60%]">{name || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Type</span><span className="text-sm font-medium text-foreground">{eventTypes.find(t => t.value === type)?.label || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Theme</span><span className="text-sm font-medium text-foreground">{eventThemes.find(t => t.value === theme)?.label || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Date</span><span className="text-sm font-medium text-foreground">{dateStart || "TBD"}</span></div>
                  {startTime && <div className="flex justify-between"><span className="text-sm text-muted-foreground">Time</span><span className="text-sm font-medium text-foreground">{startTime}{endTime ? ` - ${endTime}` : ""}</span></div>}
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Location</span><span className="text-sm font-medium text-foreground text-right max-w-[60%]">{location || "TBD"}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Guests</span><span className="text-sm font-medium text-foreground">{guestCount}</span></div>
                  <div className="flex justify-between"><span className="text-sm text-muted-foreground">Budget</span><span className="text-sm font-medium text-foreground">${budget[0].toLocaleString()}</span></div>
                </div>

                {selectedVenue && (
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Venue</h3>
                    <p className="text-sm font-bold text-foreground">{selectedVenue.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedVenue.price_range}</p>
                  </div>
                )}

                {selectedVendors.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Vendors ({selectedVendors.length})</h3>
                    {selectedVendors.map(v => (
                      <div key={v.id} className="flex justify-between py-1">
                        <span className="text-sm text-foreground">{v.name}</span>
                        <span className="text-xs text-muted-foreground">{v.price_range}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedDecor.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Decor ({selectedDecor.length})</h3>
                    {selectedDecor.map(d => (
                      <div key={d.id} className="flex justify-between py-1">
                        <span className="text-sm text-foreground">{d.name}</span>
                        <span className="text-xs text-muted-foreground">${d.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-secondary rounded-2xl p-4">
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-foreground">Estimated Total</span>
                    <span className="text-foreground">${runningTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer — hidden on the visualization step which has its own CTA */}
      {step !== 8 && (
        <div className="px-5 pb-8 pt-3">
          <Button className="w-full py-6 text-base font-semibold" disabled={saving}
            onClick={() => {
              if (step < 9) handleNext();
              else handleFinish();
            }}>
              {step === 9
                ? (saving ? "Creating..." : "Continue to Payment")
                : step === 4 && !selectedVenue
                  ? "Continue (skip venue)"
                  : "Continue"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateEvent;
