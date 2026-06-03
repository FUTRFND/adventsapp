import { cn } from "@/lib/utils";
import logoAsset from "@/assets/advents-logo.png.asset.json";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showMark?: boolean;
  showWordmark?: boolean;
}

const sizeMap = {
  sm: { text: "text-xl", mark: "w-8 h-8" },
  md: { text: "text-3xl", mark: "w-10 h-10" },
  lg: { text: "text-4xl", mark: "w-12 h-12" },
  xl: { text: "text-5xl", mark: "w-16 h-16" },
};

/**
 * Advents wordmark + mark.
 * Uses the official Advents logo image for the mark and the brand
 * blue→purple gradient on the wordmark.
 */
const Logo = ({ className, size = "md", showMark = true, showWordmark = true }: LogoProps) => {
  const s = sizeMap[size];
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {showMark && (
        <img
          src={logoAsset.url}
          alt="Advents"
          className={cn("rounded-xl object-contain", s.mark)}
        />
      )}
      {showWordmark && (
        <span
          className={cn(
            "font-display font-extrabold tracking-tight bg-brand-gradient bg-clip-text text-transparent leading-none",
            s.text,
          )}
        >
          Advents
        </span>
      )}
    </div>
  );
};

export default Logo;
