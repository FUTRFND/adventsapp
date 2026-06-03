import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryMedia = { type: "image" | "video"; url: string };

interface MediaGalleryProps {
  media: GalleryMedia[];
  className?: string;
}

/**
 * Swipeable, media-first carousel with thumbnail strip.
 * - Horizontal snap-scroll for swipe on mobile (iOS + Android).
 * - Thumbnail strip jumps to a slide.
 * - Videos render inline with native controls.
 */
const MediaGallery = ({ media, className }: MediaGalleryProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

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

  if (!media || media.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={scrollerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-secondary flex snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: "none" }}
      >
        {media.map((m, i) => (
          <div key={i} className="snap-center flex-shrink-0 w-full h-full relative bg-black">
            {m.type === "video" ? (
              <VideoSlide url={m.url} isActive={i === active} />
            ) : (
              <img src={m.url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
        ))}

        {media.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
            {media.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-6 bg-white" : "w-1.5 bg-white/60",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar" style={{ scrollbarWidth: "none" }}>
          {media.map((m, i) => (
            <button
              key={i}
              onClick={() => jump(i)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-secondary border-2 transition-all",
                i === active ? "border-primary" : "border-transparent opacity-70",
              )}
            >
              {m.type === "video" ? (
                <>
                  <video src={m.url} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </>
              ) : (
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const VideoSlide = ({ url, isActive }: { url: string; isActive: boolean }) => {
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
      <iframe
        src={url.replace("watch?v=", "embed/")}
        title="Video"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
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
          onClick={() => ref.current?.play()}
          className="absolute inset-0 flex items-center justify-center bg-black/30"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-elevated">
            <Play className="w-7 h-7 text-primary fill-primary ml-1" />
          </div>
        </button>
      )}
    </div>
  );
};

export default MediaGallery;
