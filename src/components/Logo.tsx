import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showMark?: boolean;
}

const sizeMap = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-4xl",
  xl: "text-5xl",
};

/**
 * ADvents wordmark with the brand blue→purple gradient.
 * Renders consistently across auth, splash and navigation surfaces.
 */
const Logo = ({ className, size = "md", showMark = true }: LogoProps) => (
  <div className={cn("inline-flex items-center gap-2", className)}>
    {showMark && (
      <span className="inline-flex w-9 h-9 rounded-xl items-center justify-center bg-brand-gradient shadow-brand">
        <span className="text-white font-display font-extrabold text-lg leading-none">A</span>
      </span>
    )}
    <span
      className={cn(
        "font-display font-extrabold tracking-tight bg-brand-gradient bg-clip-text text-transparent leading-none",
        sizeMap[size],
      )}
    >
      ADvents
    </span>
  </div>
);

export default Logo;
