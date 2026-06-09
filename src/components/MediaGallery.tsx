import { useState, useRef, useEffect } from "react";
import { Film, Image as ImageIcon, Maximize2, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryMedia = { type: "image" | "video"; url: string; label?: string };

interface MediaGalleryProps {
  media: GalleryMedia[];
  className?: string;
  variant?: "default" | "hero";
  title?: string;
}

const placeholderMedia: GalleryMedia[] = [
  { type: "image", url: "", label: "Signature venue moment" },
  { type: "image", url: "", label: "Styled event detail" },
  { type: "video", url: "", label: "Walkthrough preview" },
];

/**
 * Swipeable, media-first carousel with thumbnail strip and fullscreen viewer.
 * - Horizontal snap-scroll for swipe on mobile (iOS + Android).
 * - Thumbnail strip jumps to a slide.
 * - Images and videos open into a fullscreen viewer/player.
 */
const MediaGallery = ({ media, className, variant = "default", title = "Media gallery" }: MediaGalleryProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const displayMedia = media?.length ? media : placeholderMedia;
  const photoCount = media?.filter((m) => m.type === "image").length || 0;
  const videoCount = media?.filter((m) => m.type === "video").length || 0;

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setActive(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const jump = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={scrollerRef}
        className={cn(
          "relative w-full overflow-hidden bg-secondary flex snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar shadow-elevated",
          variant === "hero" ? "aspect-[4/5] rounded-none" : "aspect-[4/3] rounded-2xl",
        )}
        style={{ scrollbarWidth: "none" }}
        aria-label={title}
      >
        {displayMedia.map((m, i) => (
          <div key={`${m.type}-${i}`} className="snap-center flex-shrink-0 w-full h-full relative bg-foreground">
            {!m.url ? (
              <PlaceholderSlide type={m.type} label={m.label || "Gallery preview"} />
            ) : m.type === "video" ? (
              <VideoSlide url={m.url} isActive={i === active} onOpen={() => setFullscreenIndex(i)} />
            ) : (
              <button type="button" onClick={() => setFullscreenIndex(i)} className="block w-full h-full">
                <img src={m.url} alt={m.label || title} className="w-full h-full object-cover" loading="lazy" />
              </button>
            )}
          </div>
        ))}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md shadow-soft">
            <ImageIcon className="h-3.5 w-3.5 text-primary" /> {photoCount} Photos
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md shadow-soft">
            <Film className="h-3.5 w-3.5 text-primary" /> {videoCount} Videos
          </span>
        </div>

        {media?.length === 0 && (
          <div className="absolute bottom-12 left-4 right-4 rounded-xl bg-background/85 p-3 text-left backdrop-blur-md shadow-soft">
            <p className="text-sm font-bold text-foreground">Professional gallery preview</p>
            <p className="text-xs text-muted-foreground">Photos and video walkthroughs appear here when added.</p>
          </div>
        )}

        {displayMedia[active]?.url && (
          <button
            type="button"
            onClick={() => setFullscreenIndex(active)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/85 text-foreground backdrop-blur-md shadow-soft"
            aria-label="Open fullscreen media viewer"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}

        {displayMedia.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
            {displayMedia.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-7 bg-background" : "w-1.5 bg-background/60",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {displayMedia.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar" style={{ scrollbarWidth: "none" }}>
          {displayMedia.map((m, i) => (
            <button
              key={i}
              onClick={() => jump(i)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-secondary border-2 transition-all shadow-soft",
                i === active ? "border-primary opacity-100" : "border-transparent opacity-70",
              )}
              aria-label={`Show ${m.type} ${i + 1}`}
            >
              {!m.url ? (
                <PlaceholderSlide type={m.type} compact label={m.label || "Gallery preview"} />
              ) : m.type === "video" ? (
                <>
                  <video src={m.url} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/35">
                    <Play className="w-4 h-4 text-background fill-background" />
                  </div>
                </>
              ) : (
                <img src={m.url} alt={m.label || title} className="w-full h-full object-cover" loading="lazy" />
              )}
            </button>
          ))}
        </div>
      )}

      {fullscreenIndex !== null && displayMedia[fullscreenIndex]?.url && (
        <FullscreenViewer
          item={displayMedia[fullscreenIndex]}
          title={title}
          onClose={() => setFullscreenIndex(null)}
        />
      )}
    </div>
  );
};

const PlaceholderSlide = ({ type, label, compact = false }: { type: "image" | "video"; label: string; compact?: boolean }) => (
  <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-brand-soft-gradient">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,hsl(var(--brand-blue)/0.22),transparent_34%),radial-gradient(circle_at_75%_70%,hsl(var(--brand-purple)/0.22),transparent_36%)]" />
    <div className={cn("relative flex flex-col items-center text-center", compact ? "gap-1" : "gap-3 px-8")}>
      <div className={cn("rounded-full bg-background/80 text-primary shadow-soft backdrop-blur-md", compact ? "p-2" : "p-5")}>
        {type === "video" ? <Film className={compact ? "h-4 w-4" : "h-8 w-8"} /> : <ImageIcon className={compact ? "h-4 w-4" : "h-8 w-8"} />}
      </div>
      {!compact && <p className="text-sm font-semibold text-foreground">{label}</p>}
    </div>
  </div>
);

const VideoSlide = ({ url, isActive, onOpen }: { url: string; isActive: boolean; onOpen: () => void }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!isActive && ref.current && !ref.current.paused) {
      ref.current.pause();
      setPlaying(false);
    }
  }, [isActive]);

  const isFile = /\.(mp4|webm|mov|m4v)$/i.test(url);
  if (!isFile) {
    return (
      <div className="relative h-full w-full">
        <iframe
          src={url.replace("watch?v=", "embed/")}
          title="Video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <button type="button" onClick={onOpen} className="absolute inset-0" aria-label="Open fullscreen video" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={ref}
        src={url}
        className="w-full h-full object-cover"
        playsInline
        controls={playing}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {!playing && (
        <button
          type="button"
          onClick={onOpen}
          className="absolute inset-0 flex items-center justify-center bg-foreground/35"
          aria-label="Open fullscreen video player"
        >
          <div className="w-16 h-16 rounded-full bg-background/90 flex items-center justify-center shadow-elevated">
            <Play className="w-7 h-7 text-primary fill-primary ml-1" />
          </div>
        </button>
      )}
    </div>
  );
};

const FullscreenViewer = ({ item, title, onClose }: { item: GalleryMedia; title: string; onClose: () => void }) => {
  const isFileVideo = item.type === "video" && /\.(mp4|webm|mov|m4v)$/i.test(item.url);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/95 p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-elevated"
        aria-label="Close fullscreen viewer"
      >
        <X className="h-5 w-5" />
      </button>
      {item.type === "image" ? (
        <img src={item.url} alt={item.label || title} className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-elevated" />
      ) : isFileVideo ? (
        <video src={item.url} className="max-h-[90vh] max-w-full rounded-xl shadow-elevated" controls autoPlay playsInline />
      ) : (
        <iframe
          src={item.url.replace("watch?v=", "embed/")}
          title={item.label || title}
          className="h-[70vh] w-full max-w-4xl rounded-xl bg-foreground shadow-elevated"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default MediaGallery;
