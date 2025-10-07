import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeroSectionProps {
  backgroundImage: string;
  onSearch?: (location: string) => void;
}

const destinations = [
  { value: "leticia", label: "Leticia" },
  { value: "puerto-narino", label: "Puerto Nariño" },
  { value: "mocagua", label: "Mocagua" }
];

export default function HeroSection({ backgroundImage, onSearch }: HeroSectionProps) {
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    onSearch?.(location);
    console.log("Search triggered:", { location });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/90" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Discover the Amazon
          </h1>
          <p className="text-xl sm:text-2xl text-white/95 max-w-3xl mx-auto drop-shadow-md">
            Immerse yourself in the world's most biodiverse rainforest
          </p>
        </div>

        <div className="max-w-3xl mx-auto backdrop-blur-md bg-white/10 rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">Choose Your Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger 
                    data-testid="select-location"
                    className="pl-10 bg-white/90 border-white/30 text-foreground h-11"
                  >
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((dest) => (
                      <SelectItem key={dest.value} value={dest.value}>
                        {dest.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="md:col-span-1 flex items-end">
              <Button 
                data-testid="button-search"
                onClick={handleSearch}
                className="w-full gap-2"
                size="lg"
              >
                <Search className="w-5 h-5" />
                Explore Tours
              </Button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
              <span className="text-lg">⭐</span>
              <span className="font-medium">4.9 • Trusted by 50,000+ explorers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
