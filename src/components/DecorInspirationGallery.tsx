import { useMemo, useState } from "react";
import { Heart, Film, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type MediaItem = { type: "image" | "video"; url: string };
type Board = {
  id: string;
  title: string;
  style_category: string;
  cover_url?: string | null;
  media?: MediaItem[] | any;
};

export type DecorPin = {
  id: string;
  name: string;
  image_url: string;
  type: "image" | "video";
  board_id: string;
  board_title: string;
  style_category: string;
};

interface Props {
  boards: Board[];
  theme?: string;
  eventType?: string;
  selected: any[];
  onToggle: (pin: DecorPin) => void;
}

const stylePool = ["Wedding", "Modern", "Rustic", "Tropical", "Elegant", "Bohemian", "Minimalist", "Luxury", "Garden", "Vintage"];

/**
 * Pinterest-style masonry inspiration gallery.
 * - Visual-first: no pricing, no inventory lines.
 * - Mixed tile heights for collage feel.
 * - Tap a tile to favorite/add to mood board; tap-hold (long press fallback via overlay button) opens fullscreen.
 */
const DecorInspirationGallery = ({ boards, theme, eventType, selected, onToggle }: Props) => {
  const [viewer, setViewer] = useState<DecorPin | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const pins: DecorPin[] = useMemo(() => {
    const flat: DecorPin[] = [];
    boards.forEach((b) => {
      const media: MediaItem[] = Array.isArray(b.media) ? b.media : [];
      const list = media.length ? media : b.cover_url ? [{ type: "image" as const, url: b.cover_url }] : [];
      list.forEach((m, idx) => {
        if (!m?.url) return;
        flat.push({
          id: `${b.id}-${idx}`,
          name: `${b.title} ${idx + 1}`,
          image_url: m.url,
          type: m.type === "video" ? "video" : "image",
          board_id: b.id,
          board_title: b.title,
          style_category: b.style_category,
        });
      });
    });
    return flat;
  }, [boards]);

  const filters = useMemo(() => {
    const set = new Set<string>(["All"]);
    boards.forEach((b) => set.add(b.style_category));
    // Surface theme/eventType matches first
    return Array.from(set);
  }, [boards]);

  const filtered = useMemo(() => {
    if (filter === "All") return pins;
    return pins.filter((p) => p.style_category.toLowerCase() === filter.toLowerCase());
  }, [pins, filter]);

  const isSelected = (pin: DecorPin) => selected.some((s) => s.id === pin.id);

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-2xl border border-primary/15 bg-brand-soft-gradient/60 p-3">
        <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">Build your mood board</p>
          <p className="text-xs text-muted-foreground">
            Tap any inspiration to favorite it. Your picks shape the Event Visualization{theme ? ` for your ${theme} ${eventType || "event"}` : ""}.
          </p>
        </div>
      </div>

      <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
              filter === f ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-foreground border border-border",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-secondary p-10 text-center text-sm text-muted-foreground">
          No inspiration available yet. Try a different style filter.
        </div>
      ) : (
        <div className="columns-2 gap-3 [column-fill:_balance]">
          {filtered.map((pin, i) => {
            // Vary aspect ratio for masonry collage feel
            const ratios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[3/5]", "aspect-[4/3]"];
            const ratio = ratios[i % ratios.length];
            const active = isSelected(pin);
            return (
              <div key={pin.id} className="mb-3 break-inside-avoid">
                <button
                  type="button"
                  onClick={() => onToggle(pin)}
                  onDoubleClick={() => setViewer(pin)}
                  className={cn(
                    "group relative block w-full overflow-hidden rounded-2xl bg-secondary shadow-soft transition-all",
                    ratio,
                    active && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  )}
                >
                  {pin.type === "video" ? (
                    <>
                      <video src={pin.image_url} className="absolute inset-0 h-full w-full object-cover" muted playsInline />
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur-md">
                        <Film className="h-3 w-3 text-primary" /> Video
                      </span>
                    </>
                  ) : (
                    <img src={pin.image_url} alt={pin.board_title} className="absolute inset-0 h-full w-full object-cover transition-transform group-active:scale-[0.98]" loading="lazy" />
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-foreground/70 to-transparent" />
                  <div className="absolute inset-x-2 bottom-2 flex items-end justify-between gap-2">
                    <p className="line-clamp-2 text-left text-[11px] font-semibold leading-tight text-background drop-shadow">
                      {pin.board_title}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md shadow-soft transition-all",
                      active ? "bg-primary text-primary-foreground" : "bg-background/85 text-foreground",
                    )}
                  >
                    <Heart className={cn("h-4 w-4", active && "fill-current")} />
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div className="sticky bottom-4 mt-5 rounded-2xl border border-primary/20 bg-background/90 p-3 shadow-elevated backdrop-blur-md">
          <p className="mb-2 text-xs font-semibold text-foreground">
            Inspiration Board — {selected.length} saved
          </p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {selected.map((s: any) => (
              <button
                key={s.id}
                onClick={() => onToggle(s)}
                className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-border"
                aria-label={`Remove ${s.name}`}
              >
                {s.type === "video" ? (
                  <video src={s.image_url} className="h-full w-full object-cover" muted />
                ) : (
                  <img src={s.image_url} alt={s.name} className="h-full w-full object-cover" />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors hover:bg-foreground/40">
                  <X className="h-4 w-4 text-background opacity-0 transition-opacity hover:opacity-100" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {viewer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/95 p-4" role="dialog" aria-modal="true" onClick={() => setViewer(null)}>
          <button
            type="button"
            onClick={() => setViewer(null)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-elevated"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {viewer.type === "video" ? (
            <video src={viewer.image_url} className="max-h-[90vh] max-w-full rounded-xl" controls autoPlay playsInline />
          ) : (
            <img src={viewer.image_url} alt={viewer.board_title} className="max-h-[90vh] max-w-full rounded-xl object-contain" />
          )}
        </div>
      )}
    </div>
  );
};

export default DecorInspirationGallery;
