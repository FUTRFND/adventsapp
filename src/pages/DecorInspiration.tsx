import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Props {
  /** When used inside the CreateEvent flow, these props let it act as a step. */
  embedded?: boolean;
  selected?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

const DecorInspiration = ({ embedded, selected, onSelectionChange }: Props) => {
  const navigate = useNavigate();
  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const sel = selected ?? localSelected;
  const setSel = onSelectionChange ?? setLocalSelected;

  const [openBoard, setOpenBoard] = useState<any | null>(null);

  const { data: boards = [], isLoading } = useQuery({
    queryKey: ["decor_inspiration"],
    queryFn: async () => {
      const { data } = await supabase
        .from("decor_inspiration" as any)
        .select("*")
        .order("sort_order");
      return (data as any[]) || [];
    },
  });

  const toggle = (id: string) => {
    setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  };

  // Detail view (full Pinterest-style masonry of one board)
  if (openBoard) {
    return (
      <div className="pb-24 min-h-screen">
        <div className="px-5 pt-14 pb-4 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setOpenBoard(null)} className="min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-display font-bold text-foreground">{openBoard.title}</h1>
              <p className="text-xs text-muted-foreground">{openBoard.style_category}</p>
            </div>
            <Button
              size="sm"
              onClick={() => { toggle(openBoard.id); setOpenBoard(null); }}
              variant={sel.includes(openBoard.id) ? "secondary" : "default"}
            >
              {sel.includes(openBoard.id) ? "Selected" : "Select Style"}
            </Button>
          </div>
          {openBoard.description && <p className="text-sm text-muted-foreground">{openBoard.description}</p>}
        </div>
        <div className="px-3 columns-2 gap-2 [column-fill:_balance]">
          {(openBoard.media || []).map((m: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="break-inside-avoid mb-2 rounded-xl overflow-hidden bg-secondary"
            >
              {m.type === "video" ? (
                <div className="relative">
                  <video src={m.url} className="w-full" muted loop playsInline />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-10 h-10 text-white drop-shadow-lg" />
                  </div>
                </div>
              ) : (
                <img src={m.url} alt="" loading="lazy" className="w-full block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "pb-24 min-h-screen"}>
      {!embedded && (
        <div className="px-5 pt-14 pb-4">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => navigate(-1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-xl font-display font-bold text-foreground flex-1">Decor & Styling</h1>
          </div>
          <p className="text-sm text-muted-foreground">Tap a board to explore. Select the styles that inspire you.</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-sm text-muted-foreground py-12">Loading inspiration...</div>
      ) : (
        <div className="px-3 columns-2 gap-2 [column-fill:_balance]">
          {boards.map((board, idx) => {
            const isSelected = sel.includes(board.id);
            return (
              <motion.button
                key={board.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setOpenBoard(board)}
                className="block w-full break-inside-avoid mb-2 rounded-2xl overflow-hidden relative text-left group"
              >
                <img
                  src={board.cover_url}
                  alt={board.title}
                  loading="lazy"
                  className="w-full block"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs font-medium text-white/80">{board.style_category}</p>
                  <p className="text-sm font-bold text-white leading-tight">{board.title}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggle(board.id); }}
                  className={`absolute top-2 right-2 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                    isSelected ? "bg-brand-gradient text-white" : "bg-white/70 text-foreground"
                  }`}
                  aria-label={isSelected ? "Deselect" : "Select"}
                >
                  <Check className="w-4 h-4" />
                </button>
                <div className="absolute top-2 left-2 flex gap-1">
                  {(board.media || []).slice(0, 3).map((_: any, i: number) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/80" />
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DecorInspiration;
