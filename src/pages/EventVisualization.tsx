import { motion } from "framer-motion";
import { Sparkles, MapPin, Palette, Music, Utensils, Flower2, Lightbulb, Sofa } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VisualizationData {
  eventName?: string;
  type?: string;
  theme?: string;
  location?: string;
  guestCount?: number;
  selectedVenue?: any;
  selectedVendors?: any[];
  selectedDecorBoards?: { id: string; title: string; cover_url: string; style_category: string }[];
  colorPalette?: string[];
}

interface Props {
  data: VisualizationData;
  onConfirm: () => void;
  onBack?: () => void;
}

/**
 * Dynamic visual mood board: combines venue + decor boards + vendors
 * into a Pinterest-style collage so users can "see" the event.
 * This is NOT the Event Summary screen.
 */
const EventVisualization = ({ data, onConfirm, onBack }: Props) => {
  const palette = data.colorPalette || ["#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#fafafa"];
  const decor = data.selectedDecorBoards || [];
  const vendors = data.selectedVendors || [];

  return (
    <div className="pb-32 min-h-screen">
      <div className="px-5 pt-14 pb-3">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-transparent bg-clip-text bg-brand-gradient uppercase tracking-wide">
          <Sparkles className="w-4 h-4 text-primary" /> Event Visualization
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground leading-tight">
          {data.eventName || "Your Event"}
        </h1>
        <p className="text-sm text-muted-foreground">A visual concept board to help you imagine the day.</p>
      </div>

      {/* HERO collage */}
      <div className="px-3 grid grid-cols-6 grid-rows-3 gap-2 h-72 mb-4">
        {data.selectedVenue?.image_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="col-span-4 row-span-3 rounded-2xl overflow-hidden relative"
          >
            <img src={data.selectedVenue.image_url} alt="Venue" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {data.selectedVenue.name}
            </div>
          </motion.div>
        )}
        {decor.slice(0, 2).map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * (i + 1) }}
            className="col-span-2 row-span-1 rounded-2xl overflow-hidden relative"
          >
            <img src={d.cover_url} alt={d.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-white">{d.style_category}</div>
          </motion.div>
        ))}
        {decor.length < 2 && (
          <div className="col-span-2 row-span-2 rounded-2xl bg-brand-gradient flex items-center justify-center text-white p-3">
            <div className="text-center">
              <Palette className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs font-medium">{data.theme || "Custom theme"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Palette */}
      <div className="px-5 mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Color Palette</p>
        <div className="flex gap-2 h-10">
          {palette.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              style={{ background: c }}
              className="flex-1 rounded-lg border border-border/40"
            />
          ))}
        </div>
      </div>

      {/* Decor boards row */}
      {decor.length > 0 && (
        <div className="px-5 mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Flower2 className="w-3.5 h-3.5" /> Decor Inspiration
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
            {decor.map((d) => (
              <div key={d.id} className="flex-shrink-0 w-32 rounded-xl overflow-hidden relative">
                <img src={d.cover_url} alt={d.title} className="w-32 h-32 object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-[11px] font-medium text-white leading-tight">{d.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vendor mosaic */}
      {vendors.length > 0 && (
        <div className="px-5 mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Sofa className="w-3.5 h-3.5" /> Vendors in the Mix
          </p>
          <div className="grid grid-cols-3 gap-2">
            {vendors.slice(0, 6).map((v) => (
              <div key={v.id} className="rounded-xl overflow-hidden bg-card border border-border">
                {v.image_url && <img src={v.image_url} alt={v.name} className="w-full h-20 object-cover" />}
                <div className="p-2">
                  <p className="text-[11px] font-bold text-foreground leading-tight line-clamp-1">{v.name}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{v.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vibe chips */}
      <div className="px-5 mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Concept Notes</p>
        <div className="flex flex-wrap gap-2">
          {[
            { i: Utensils, l: "Curated catering" },
            { i: Music, l: "Signature soundtrack" },
            { i: Lightbulb, l: "Layered lighting" },
            { i: Flower2, l: "Statement florals" },
          ].map(({ i: Icon, l }) => (
            <span key={l} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-foreground">
              <Icon className="w-3.5 h-3.5 text-primary" /> {l}
            </span>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-5 py-4 bg-background/90 backdrop-blur-md border-t border-border safe-area-bottom">
        <div className="flex gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
          )}
          <Button onClick={onConfirm} className="flex-[2] py-6 text-base font-semibold bg-brand-gradient text-white">
            Looks great — continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventVisualization;
