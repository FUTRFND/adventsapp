import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Star, MapPin, ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

const categories = ["All", "Venues", "Catering", "Photography", "Florists", "Entertainment"];

const venues = [
  {
    id: 1,
    name: "The Grand Ballroom",
    location: "Downtown Historic District",
    rating: 4.8,
    reviews: 236,
    priceRange: "$$$",
    capacity: "250-500",
    amenities: ["On-site Catering", "Valet Parking"],
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=250&fit=crop",
    liked: true,
  },
  {
    id: 2,
    name: "Lakeside Gardens",
    location: "Waterfront Park",
    rating: 4.6,
    reviews: 182,
    priceRange: "$$",
    capacity: "100-300",
    amenities: ["Outdoor Space", "Garden Setting"],
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=250&fit=crop",
    liked: false,
  },
  {
    id: 3,
    name: "The Modern Loft",
    location: "Arts District",
    rating: 4.9,
    reviews: 94,
    priceRange: "$$$$",
    capacity: "50-150",
    amenities: ["Industrial Chic", "Rooftop Access"],
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=250&fit=crop",
    liked: false,
  },
];

const VendorMarketplace = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [likedVenues, setLikedVenues] = useState<number[]>([1]);
  const [selectedVenue, setSelectedVenue] = useState<typeof venues[0] | null>(null);

  const toggleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedVenues((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  if (selectedVenue) {
    return (
      <div className="pb-24 min-h-screen">
        <div className="px-5 pt-14 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setSelectedVenue(null)} className="text-foreground">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-display font-bold text-foreground flex-1">Venue Selection</h1>
          </div>
        </div>

        <div className="px-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">{selectedVenue.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {selectedVenue.location}
              </p>
            </div>
            <button className="p-2" onClick={(e) => toggleLike(selectedVenue.id, e)}>
              <Heart
                className={`w-6 h-6 ${likedVenues.includes(selectedVenue.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
              />
            </button>
          </div>

          {/* Photo */}
          <div className="rounded-xl overflow-hidden mb-6">
            <img
              src={selectedVenue.image}
              alt={selectedVenue.name}
              className="w-full h-48 object-cover"
            />
          </div>

          {/* About */}
          <div className="mb-6">
            <h3 className="font-display font-bold text-foreground mb-2">About This Venue</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Capacity: </span>
                <span className="text-foreground font-medium">{selectedVenue.capacity}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Price Tier: </span>
                <span className="text-foreground font-medium">{selectedVenue.priceRange}</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <h3 className="font-display font-bold text-foreground mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {selectedVenue.amenities.map((a) => (
                <span key={a} className="px-3 py-1.5 bg-secondary text-foreground text-sm rounded-lg">{a}</span>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 fill-foreground text-foreground" />
              <span className="font-semibold text-foreground">{selectedVenue.rating}</span>
              <span className="text-sm text-muted-foreground">({selectedVenue.reviews} reviews)</span>
            </div>
            <div className="space-y-3">
              <div className="bg-secondary rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-foreground text-foreground" />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Maria</span>
                </div>
                <p className="text-sm text-foreground">
                  Absolutely stunning venue. The staff was incredibly helpful and the space exceeded our expectations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen">
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">Vendors</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            className="pl-10 h-11 bg-secondary border-0"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Venue List */}
      <div className="px-5 space-y-4">
        {venues.map((venue, index) => (
          <motion.button
            key={venue.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedVenue(venue)}
            className="w-full bg-card border border-border rounded-xl overflow-hidden text-left hover:shadow-card transition-shadow"
          >
            <div className="relative">
              <img src={venue.image} alt={venue.name} className="w-full h-40 object-cover" />
              <button
                className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full"
                onClick={(e) => toggleLike(venue.id, e)}
              >
                <Heart
                  className={`w-5 h-5 ${likedVenues.includes(venue.id) ? "fill-destructive text-destructive" : "text-foreground"}`}
                />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-1">{venue.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3" /> {venue.location}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-foreground text-foreground" />
                  <span className="text-sm font-medium text-foreground">{venue.rating}</span>
                  <span className="text-xs text-muted-foreground">({venue.reviews})</span>
                </div>
                <span className="text-sm font-medium text-foreground">{venue.priceRange}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default VendorMarketplace;
