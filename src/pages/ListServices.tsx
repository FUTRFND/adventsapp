import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Store, ToggleLeft, ToggleRight, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MediaUploader, { type MediaItem } from "@/components/MediaUploader";
import { topCategories, popularCategories } from "@/data/serviceCategories";

const serviceCategories = [...topCategories, ...popularCategories].map(c => c.label);

const ListServices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Venue");
  const [description, setDescription] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [location, setLocation] = useState("");
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["user_services", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_services")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const resetForm = () => {
    setName("");
    setCategory("Venue");
    setDescription("");
    setPriceRange("");
    setLocation("");
    setGallery([]);
    setVideoUrl("");
    setEditingService(null);
    setShowForm(false);
  };

  const openEdit = (service: any) => {
    setName(service.name);
    setCategory(service.category);
    setDescription(service.description || "");
    setPriceRange(service.price_range || "");
    setLocation(service.location || "");
    setGallery(Array.isArray(service.gallery_media) ? service.gallery_media : []);
    setVideoUrl(service.video_url || "");
    setEditingService(service);
    setShowForm(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name, category, description, price_range: priceRange, location,
        gallery_media: gallery as any,
        video_url: videoUrl || null,
      };
      if (editingService) {
        const { error } = await supabase
          .from("user_services")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editingService.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_services")
          .insert({ user_id: user!.id, ...payload });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_services"] });
      toast.success(editingService ? "Service updated" : "Service listed");
      resetForm();
    },
    onError: () => toast.error("Failed to save service"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_services"] });
      toast.success("Service removed");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from("user_services").update({ is_active: !isActive }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user_services"] }),
  });

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-xl font-display font-bold text-foreground flex-1">My Services</h1>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="gap-1">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 mb-6">
            <h2 className="text-base font-bold text-foreground mb-4">{editingService ? "Edit Service" : "List a New Service"}</h2>
            <div className="space-y-3">
              <Input placeholder="Service name" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-0" />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {serviceCategories.map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <Textarea placeholder="Describe your service..." value={description} onChange={(e) => setDescription(e.target.value)} className="bg-secondary border-0 min-h-[80px]" />
              <Input placeholder="Price range (e.g. $500 - $2,000)" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="bg-secondary border-0" />
              <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-secondary border-0" />
              <Input placeholder="Highlight video URL (YouTube/Vimeo/MP4, optional)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="bg-secondary border-0" />
              <MediaUploader value={gallery} onChange={setGallery} label="Portfolio gallery" maxItems={12} />
              <div className="flex gap-2 pt-1">
                <Button onClick={() => saveMutation.mutate()} disabled={!name || saveMutation.isPending} className="flex-1">
                  {saveMutation.isPending ? "Saving..." : editingService ? "Update" : "List Service"}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
        ) : services.length === 0 && !showForm ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mb-4">You haven't listed any services yet</p>
            <Button onClick={() => setShowForm(true)}>List Your First Service</Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {services.map((service: any, index: number) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-card border border-border rounded-xl p-4 ${!service.is_active ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-foreground">{service.name}</h3>
                    <span className="text-xs text-muted-foreground">{service.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive.mutate({ id: service.id, isActive: service.is_active })}
                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                      {service.is_active ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    <button onClick={() => openEdit(service)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(service.id)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
                {service.description && <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{service.description}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {service.price_range && <span>{service.price_range}</span>}
                  {service.location && <span>{service.location}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListServices;
