import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface Suggestion {
  display_name: string;
  place_id: number;
}

const LocationAutocomplete = ({ value, onChange, placeholder = "Austin, TX", className }: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=0`,
          { headers: { "Accept-Language": "en" } }
        );
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (suggestion: Suggestion) => {
    // Shorten to city/state/country level
    const parts = suggestion.display_name.split(", ");
    const short = parts.length > 3 ? parts.slice(0, 3).join(", ") : suggestion.display_name;
    onChange(short);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          fetchSuggestions(e.target.value);
        }}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={`h-12 bg-secondary border-0 text-foreground pr-10 ${className}`}
      />
      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />

      {showSuggestions && (
        <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-elevated overflow-hidden">
          {loading && <p className="px-4 py-3 text-xs text-muted-foreground">Searching...</p>}
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              onClick={() => handleSelect(s)}
              className="w-full flex items-start gap-2.5 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-0 min-h-[44px]"
            >
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-sm text-foreground leading-snug line-clamp-2">{s.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
