import { useLocation } from "wouter";
import HeroSection from "@/components/HeroSection";
import TourCard from "@/components/TourCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import heroImage from '@assets/generated_images/Amazon_canopy_sunlight_hero_975fbf35.png';
import jaguarImage from '@assets/generated_images/Amazon_jaguar_wildlife_encounter_30857d91.png';
import dolphinImage from '@assets/generated_images/Pink_dolphins_Amazon_sunset_d0aee95e.png';
import canoeImage from '@assets/generated_images/Canoe_Amazon_river_dawn_94feb359.png';
import macawImage from '@assets/generated_images/Macaws_Amazon_rainforest_birds_fd5ba5b5.png';
import canopyImage from '@assets/generated_images/Canopy_walkway_adventure_Amazon_06cf19ac.png';

//todo: remove mock functionality
const featuredTours = [
  {
    id: "1",
    image: jaguarImage,
    title: "Wildlife Expedition: Jaguar Tracking",
    description: "Track the elusive jaguar through dense rainforest with expert guides and witness the Amazon's apex predator in its natural habitat.",
    duration: "5 days",
    difficulty: "Challenging" as const,
    price: 899,
    rating: 4.8,
    reviews: 124,
    groupSize: "Max 8"
  },
  {
    id: "2",
    image: dolphinImage,
    title: "Pink Dolphin River Adventure",
    description: "Experience the magic of the Amazon River and encounter the rare pink river dolphins during golden hour.",
    duration: "3 days",
    difficulty: "Easy" as const,
    price: 649,
    rating: 4.9,
    reviews: 187,
    groupSize: "Max 12"
  },
  {
    id: "3",
    image: canoeImage,
    title: "Traditional Canoe Journey",
    description: "Navigate peaceful tributaries in traditional canoes, discovering hidden wildlife and indigenous communities.",
    duration: "4 days",
    difficulty: "Moderate" as const,
    price: 729,
    rating: 4.7,
    reviews: 95,
    groupSize: "Max 10"
  },
  {
    id: "4",
    image: macawImage,
    title: "Birdwatching Paradise",
    description: "Spot over 300 species of colorful birds including macaws, toucans, and rare endemic species.",
    duration: "3 days",
    difficulty: "Easy" as const,
    price: 579,
    rating: 4.8,
    reviews: 143,
    groupSize: "Max 15"
  },
  {
    id: "5",
    image: canopyImage,
    title: "Canopy Walkway Adventure",
    description: "Walk among the treetops on suspended bridges and experience the rainforest from a bird's-eye perspective.",
    duration: "2 days",
    difficulty: "Moderate" as const,
    price: 449,
    rating: 4.6,
    reviews: 76,
    groupSize: "Max 12"
  },
  {
    id: "6",
    image: jaguarImage,
    title: "Night Safari Experience",
    description: "Discover the Amazon's nocturnal wildlife with expert guides during an unforgettable night safari.",
    duration: "1 day",
    difficulty: "Easy" as const,
    price: 199,
    rating: 4.9,
    reviews: 201,
    groupSize: "Max 8"
  }
];

export default function HomePage() {
  const [, setLocation] = useLocation();

  const handleSearch = (destination: string) => {
    console.log('Search:', { destination });
    setLocation('/tours');
  };

  const handleTourClick = (id: string) => {
    setLocation(`/tour/${id}`);
  };

  return (
    <div>
      <HeroSection backgroundImage={heroImage} onSearch={handleSearch} />

      <section className="bg-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">Our Destinations</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three unique locations in the heart of the Amazon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <Card>
              <CardContent className="p-8">
                <h3 className="font-serif text-2xl font-semibold mb-3">Leticia</h3>
                <p className="text-muted-foreground mb-4">
                  The gateway to the Amazon, where Colombia, Brazil, and Peru meet. Experience vibrant wildlife and rich indigenous culture.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation('/tours')}
                  data-testid="button-leticia"
                >
                  Explore Leticia
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h3 className="font-serif text-2xl font-semibold mb-3">Puerto Nariño</h3>
                <p className="text-muted-foreground mb-4">
                  A peaceful riverside town known for sustainable tourism. Perfect for pink dolphin encounters and traditional river life.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation('/tours')}
                  data-testid="button-puerto-narino"
                >
                  Explore Puerto Nariño
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h3 className="font-serif text-2xl font-semibold mb-3">Mocagua</h3>
                <p className="text-muted-foreground mb-4">
                  An indigenous community offering authentic jungle experiences and wildlife rehabilitation projects.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation('/tours')}
                  data-testid="button-mocagua"
                >
                  Explore Mocagua
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">Featured Tours</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Handpicked adventures across all three destinations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} {...tour} onClick={handleTourClick} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">Why Choose Amazonas Tours</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌿</span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Eco-Friendly</h3>
                <p className="text-muted-foreground">
                  We prioritize sustainable tourism and support local conservation efforts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👨‍🏫</span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Expert Guides</h3>
                <p className="text-muted-foreground">
                  Learn from certified naturalists with decades of rainforest experience
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏕️</span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Authentic Lodges</h3>
                <p className="text-muted-foreground">
                  Stay in comfortable eco-lodges that blend seamlessly with nature
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
