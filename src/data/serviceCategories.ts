// Expanded service categories for the ADvents marketplace
// Top 10 = shown prominently on the home page
// Popular = popular filter chips
// Full = complete list used by search/filter

import {
  MapPin, ChefHat, Camera, Music, Cake, Sparkles, Wine, Video,
  ClipboardList, Mic2, Flower2, Sofa, Lightbulb, Speaker, UserCheck,
  Scissors, Megaphone, Shirt, Car, Aperture, Cake as CakeIcon,
  GlassWater, Gift, PartyPopper, Palette, Ticket, Heart, Tent,
  TreePine, Stars, Wand2, Utensils, Brush, Hand, ScrollText,
  BookOpen, BadgeCheck, Sun, Building2, Bus, Plane, Briefcase,
  Sprout, Wrench, ShieldCheck, HeartHandshake, type LucideIcon,
} from "lucide-react";

export type ServiceCategory = {
  value: string;
  label: string;
  icon: LucideIcon;
  synonyms?: string[];
};

// Top 10 home screen categories (in display order)
export const topCategories: ServiceCategory[] = [
  { value: "venue", label: "Venue", icon: MapPin, synonyms: ["location", "space", "hall"] },
  { value: "catering", label: "Catering", icon: ChefHat, synonyms: ["food", "caterer"] },
  { value: "photography", label: "Photography", icon: Camera, synonyms: ["photographer", "photos"] },
  { value: "dj", label: "DJ", icon: Music, synonyms: ["music", "dj"] },
  { value: "bakery", label: "Bakery / Cake", icon: Cake, synonyms: ["cake", "dessert", "pastry"] },
  { value: "decor", label: "Decor & Styling", icon: Sparkles, synonyms: ["styling", "decoration", "design"] },
  { value: "bar", label: "Bar Service", icon: Wine, synonyms: ["bartender", "drinks", "mixology"] },
  { value: "videography", label: "Videography", icon: Video, synonyms: ["video", "cinematographer", "film"] },
  { value: "planner", label: "Event Planner", icon: ClipboardList, synonyms: ["planner", "planning"] },
  { value: "band", label: "Live Band", icon: Mic2, synonyms: ["band", "live music", "musicians"] },
];

// Popular filter chips
export const popularCategories: ServiceCategory[] = [
  { value: "floral", label: "Floral Design", icon: Flower2, synonyms: ["florist", "flowers"] },
  { value: "rentals", label: "Furniture & Rentals", icon: Sofa, synonyms: ["furniture", "rental"] },
  { value: "lighting", label: "Lighting", icon: Lightbulb },
  { value: "av", label: "Sound & AV", icon: Speaker, synonyms: ["audio", "av", "sound"] },
  { value: "coordinator", label: "Event Coordinator", icon: UserCheck },
  { value: "beauty", label: "Hair & Makeup", icon: Scissors, synonyms: ["makeup", "hair", "beauty"] },
  { value: "mc", label: "MC / Host", icon: Megaphone, synonyms: ["host", "emcee", "mc"] },
  { value: "attire", label: "Attire / Dress", icon: Shirt, synonyms: ["dress", "tux", "suit"] },
  { value: "transport", label: "Transportation", icon: Car, synonyms: ["transport", "limo", "shuttle"] },
  { value: "photobooth", label: "Photo Booth", icon: Aperture, synonyms: ["booth", "selfie"] },
];

// Full category list (50+) used by search and filtering
export const allCategories: ServiceCategory[] = [
  ...topCategories,
  ...popularCategories,
  { value: "dessert-bar", label: "Dessert Bar", icon: CakeIcon },
  { value: "coffee-bar", label: "Coffee / Espresso Bar", icon: GlassWater },
  { value: "favors", label: "Favors & Gifts", icon: Gift },
  { value: "entertainment", label: "Entertainment", icon: PartyPopper, synonyms: ["entertainer"] },
  { value: "balloons", label: "Balloon Artistry", icon: PartyPopper },
  { value: "calligraphy", label: "Calligraphy & Signage", icon: Brush },
  { value: "stationery", label: "Invitations & Stationery", icon: ScrollText, synonyms: ["invites", "save the date"] },
  { value: "officiant", label: "Officiant", icon: BookOpen },
  { value: "ceremony", label: "Ceremony Production", icon: Heart },
  { value: "rehearsal", label: "Rehearsal Dinner", icon: Utensils },
  { value: "tents", label: "Tents & Structures", icon: Tent },
  { value: "outdoor", label: "Outdoor / Garden", icon: TreePine },
  { value: "fireworks", label: "Fireworks & SFX", icon: Stars },
  { value: "magician", label: "Magician / Performer", icon: Wand2 },
  { value: "chef", label: "Private Chef", icon: ChefHat },
  { value: "muralist", label: "Live Painter / Muralist", icon: Palette },
  { value: "ticketing", label: "Ticketing", icon: Ticket },
  { value: "security", label: "Security", icon: ShieldCheck },
  { value: "concierge", label: "Concierge", icon: Hand },
  { value: "production", label: "Production Crew", icon: Wrench },
  { value: "branding", label: "Event Branding", icon: BadgeCheck },
  { value: "kids", label: "Kids Entertainment", icon: Sun },
  { value: "venue-corporate", label: "Corporate Venue", icon: Building2 },
  { value: "shuttle", label: "Shuttle Service", icon: Bus },
  { value: "travel", label: "Travel Coordination", icon: Plane },
  { value: "speakers", label: "Speakers", icon: Briefcase },
  { value: "wellness", label: "Wellness / Spa", icon: Sprout },
  { value: "charity", label: "Charity Partner", icon: HeartHandshake },
];

// Synonym → canonical value resolver used in search
const synonymIndex: Record<string, string> = {};
for (const c of allCategories) {
  synonymIndex[c.label.toLowerCase()] = c.value;
  synonymIndex[c.value.toLowerCase()] = c.value;
  for (const s of c.synonyms || []) synonymIndex[s.toLowerCase()] = c.value;
}

export function resolveCategoryQuery(q: string): string | null {
  if (!q) return null;
  const k = q.trim().toLowerCase();
  return synonymIndex[k] || null;
}

export function searchCategories(q: string): ServiceCategory[] {
  if (!q.trim()) return allCategories;
  const k = q.trim().toLowerCase();
  return allCategories.filter(c =>
    c.label.toLowerCase().includes(k) ||
    c.value.toLowerCase().includes(k) ||
    (c.synonyms || []).some(s => s.toLowerCase().includes(k))
  );
}
