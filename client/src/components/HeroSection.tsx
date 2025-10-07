import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface HeroSectionProps {
  backgroundImage: string;
  onSearch?: (location: string, date: string, guests: number) => void;
}

export default function HeroSection({ backgroundImage, onSearch }: HeroSectionProps) {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");

  const handleSearch = () => {
    onSearch?.(location, date, parseInt(guests));
    console.log("Search triggered:", { location, date, guests });
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

        <div className="max-w-5xl mx-auto backdrop-blur-md bg-white/10 rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  data-testid="input-location"
                  placeholder="Where to?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 bg-white/90 border-white/30 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  data-testid="input-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 bg-white/90 border-white/30 text-foreground"
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white mb-2">Guests</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  data-testid="input-guests"
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="pl-10 bg-white/90 border-white/30 text-foreground"
                />
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
                Search
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
