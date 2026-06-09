import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Film, Heart, Image as ImageIcon, Star, MapPin, Search, Play } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topCategories, popularCategories, resolveCategoryQuery } from "@/data/serviceCategories";
import MediaGallery, { type GalleryMedia } from "@/components/MediaGallery";
import Logo from "@/components/Logo";

const buildMedia = (vendor: any): GalleryMedia[] => {
  const items: GalleryMedia[] = [];
  if (vendor?.image_url) items.push({ type: "image", url: vendor.image_url });
  if (Array.isArray(vendor?.gallery_media)) {
    for (const m of vendor.gallery_media) {
      if (m?.url && (m.type === "image" || m.type === "video")) items.push(m);
    }
  }
  if (vendor?.video_url) items.push({ type: "video", url: vendor.video_url });
  // de-dupe by url
  const seen = new Set<string>();
  return items.filter((m) => (seen.has(m.url) ? false : (seen.add(m.url), true)));
};

const mediaCounts = (media: GalleryMedia[]) => ({
  photos: media.filter((m) => m.type === "image").length,
  videos: media.filter((m) => m.type === "video").length,
});

const filterChips = [
  { value: "all", label: "All" },
  ...topCategories.map(c => ({ value: c.value, label: c.label })),
  ...popularCategories.map(c => ({ value: c.value, label: c.label })),
];

const VendorMarketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors", activeCategory, searchQuery],
    queryFn: async () => {
      let query = supabase.from("vendors").select("*");
      if (activeCategory !== "all") {
        // Match category by label (canonical) or any vendor row whose category
        // text ILIKE the resolved canonical token. Supports synonyms via the URL.
        const canonical = resolveCategoryQuery(activeCategory) || activeCategory;
        query = query.ilike("category", `%${canonical}%`);
      }
      if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);
      const { data } = await query.order("rating", { ascending: false });
      return data || [];
    },
  });

  const { data: savedVendorIds = [] } = useQuery({
    queryKey: ["saved_vendors", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("saved_vendors").select("vendor_id").eq("user_id", user!.id);
      return (data || []).map(sv => sv.vendor_id);
    },
    enabled: !!user,
  });

  const toggleSave = useMutation({
    mutationFn: async (vendorId: string) => {
      if (savedVendorIds.includes(vendorId)) {
        await supabase.from("saved_vendors").delete().eq("user_id", user!.id).eq("vendor_id", vendorId);
      } else {
        await supabase.from("saved_vendors").insert({ user_id: user!.id, vendor_id: vendorId });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved_vendors"] }),
  });

  if (selectedVendor) {
    const media = buildMedia(selectedVendor);
    const counts = mediaCounts(media);
    return (
      <div className="pb-24 min-h-screen">
        <div className="relative">
          <MediaGallery media={media} variant="hero" title={`${selectedVendor.name} media gallery`} />
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-5 pt-14">
            <button onClick={() => setSelectedVendor(null)} className="text-foreground min-w-[44px] min-h-[44px] rounded-full bg-background/90 backdrop-blur-md shadow-soft flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button>
            <div className="rounded-full bg-background/90 px-3 py-2 backdrop-blur-md shadow-soft">
              <Logo size="sm" showWordmark={false} />
            </div>
            <button className="text-foreground min-w-[44px] min-h-[44px] rounded-full bg-background/90 backdrop-blur-md shadow-soft flex items-center justify-center" onClick={() => toggleSave.mutate(selectedVendor.id)}>
              <Heart className={`w-5 h-5 ${savedVendorIds.includes(selectedVendor.id) ? "fill-destructive text-destructive" : "text-foreground"}`} />
            </button>
          </div>
        </div>

        <div className="px-5 -mt-8 relative z-10">
          <div className="glass-card rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><ImageIcon className="w-3.5 h-3.5" /> {counts.photos} Photos</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"><Film className="w-3.5 h-3.5" /> {counts.videos} Videos</span>
            </div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">{selectedVendor.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedVendor.location}</p>
            </div>
          </div>

          <p className="text-sm text-foreground mb-6">{selectedVendor.description}</p>
          <div className="mb-6">
            <h3 className="font-display font-bold text-foreground mb-2">Details</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {selectedVendor.capacity && <div><span className="text-muted-foreground">Capacity: </span><span className="text-foreground font-medium">{selectedVendor.capacity}</span></div>}
              <div><span className="text-muted-foreground">Price: </span><span className="text-foreground font-medium">{selectedVendor.price_range}</span></div>
              <div><span className="text-muted-foreground">Category: </span><span className="text-foreground font-medium">{selectedVendor.category}</span></div>
            </div>
          </div>
          {selectedVendor.amenities?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-display font-bold text-foreground mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {selectedVendor.amenities.map((a: string) => <span key={a} className="px-3 py-1.5 bg-secondary text-foreground text-sm rounded-lg">{a}</span>)}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-foreground text-foreground" />
            <span className="font-semibold text-foreground">{selectedVendor.rating}</span>
            <span className="text-sm text-muted-foreground">({selectedVendor.review_count} reviews)</span>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-5 pt-14 pb-4 brand-section-header">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">Vendors</h1>
          <Logo size="sm" showWordmark={false} />
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11 bg-secondary border-0" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {filterChips.map((cat) => (
            <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-4">
        {vendors.map((vendor, index) => {
          const cardMedia = buildMedia(vendor);
          const mediaCount = cardMedia.length;
          const hasVideo = cardMedia.some((m) => m.type === "video");
          return (
          <motion.button key={vendor.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }} onClick={() => setSelectedVendor(vendor)}
            className="w-full bg-card border border-border rounded-xl overflow-hidden text-left hover:shadow-card transition-shadow">
            <div className="relative">
              <img src={vendor.image_url} alt={vendor.name} className="w-full h-40 object-cover" />
              {hasVideo && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                  <Play className="w-3 h-3 text-white fill-white" />
                  <span className="text-[10px] text-white font-medium">Video</span>
                </div>
              )}
              {mediaCount > 1 && (
                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                  <span className="text-[10px] text-white font-medium">{mediaCount} photos</span>
                </div>
              )}
              <button className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full"
                onClick={(e) => { e.stopPropagation(); toggleSave.mutate(vendor.id); }}>
                <Heart className={`w-5 h-5 ${savedVendorIds.includes(vendor.id) ? "fill-destructive text-destructive" : "text-foreground"}`} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-1">{vendor.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" /> {vendor.location}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-foreground text-foreground" />
                  <span className="text-sm font-medium text-foreground">{vendor.rating}</span>
                  <span className="text-xs text-muted-foreground">({vendor.review_count})</span>
                </div>
                <span className="text-sm font-medium text-foreground">{vendor.price_range}</span>
              </div>
            </div>
          </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default VendorMarketplace;
