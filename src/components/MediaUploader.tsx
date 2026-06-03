import { useRef, useState } from "react";
import { motion, Reorder } from "framer-motion";
import { ImagePlus, Video as VideoIcon, X, Star, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type MediaItem = { type: "image" | "video"; url: string };

interface MediaUploaderProps {
  value: MediaItem[];
  onChange: (next: MediaItem[]) => void;
  coverUrl?: string | null;
  onCoverChange?: (url: string | null) => void;
  bucket?: string;
  maxItems?: number;
  label?: string;
}

const MediaUploader = ({
  value,
  onChange,
  coverUrl,
  onCoverChange,
  bucket = "event-images",
  maxItems = 20,
  label = "Gallery",
}: MediaUploaderProps) => {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user) return;
    if (value.length + files.length > maxItems) {
      toast.error(`Max ${maxItems} items`);
      return;
    }
    setUploading(true);
    const next: MediaItem[] = [...value];
    for (const file of Array.from(files)) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 50MB`);
        continue;
      }
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file);
      if (error) { toast.error(error.message); continue; }
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      next.push({
        type: file.type.startsWith("video") ? "video" : "image",
        url: urlData.publicUrl,
      });
    }
    onChange(next);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
    if (coverUrl && value[idx]?.url === coverUrl) onCoverChange?.(next[0]?.url || null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
        <span className="text-xs text-muted-foreground">{value.length}/{maxItems}</span>
      </div>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="flex flex-col items-center justify-center h-28 mb-3 bg-secondary rounded-xl border-2 border-dashed border-border cursor-pointer hover:bg-secondary/70 transition-colors"
      >
        <div className="flex gap-2 text-muted-foreground mb-1">
          <ImagePlus className="w-5 h-5" />
          <VideoIcon className="w-5 h-5" />
        </div>
        <span className="text-xs text-muted-foreground">
          {uploading ? "Uploading..." : "Drag & drop, or tap to add photos & videos"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {value.length > 0 && (
        <Reorder.Group axis="y" values={value} onReorder={onChange} className="space-y-2">
          {value.map((item, idx) => (
            <Reorder.Item
              key={item.url}
              value={item}
              className="flex items-center gap-2 bg-card border border-border rounded-xl p-2"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              {item.type === "video" ? (
                <video src={item.url} className="w-14 h-14 rounded-lg object-cover bg-secondary" />
              ) : (
                <img src={item.url} alt="" className="w-14 h-14 rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">{item.type === "video" ? "Video" : "Image"} {idx + 1}</p>
              </div>
              {onCoverChange && (
                <button
                  type="button"
                  onClick={() => onCoverChange(item.url)}
                  title="Set as cover"
                  className={`p-1.5 rounded-lg ${coverUrl === item.url ? "text-amber-500" : "text-muted-foreground"}`}
                >
                  <Star className={`w-4 h-4 ${coverUrl === item.url ? "fill-amber-500" : ""}`} />
                </button>
              )}
              <button type="button" onClick={() => remove(idx)} className="p-1.5 text-destructive">
                <X className="w-4 h-4" />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
};

export default MediaUploader;
