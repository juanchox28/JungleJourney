import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/HeroSection";
import TourCard from "@/components/TourCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Tour } from "@shared/schema";
import { formatLocation, getPriceDisplay } from "@/lib/tourUtils";
import { getApiUrl } from "@/lib/utils";
import heroImage from '@assets/generated_images/Amazon_canopy_sunlight_hero_975fbf35.png';
import jaguarImage from '@assets/generated_images/Amazon_jaguar_wildlife_encounter_30857d91.png';
import dolphinImage from '@assets/generated_images/Pink_dolphins_Amazon_sunset_d0aee95e.png';
import canoeImage from '@assets/generated_images/Canoe_Amazon_river_dawn_94feb359.png';

const getImageForTour = (tour: Tour, index: number) => {
  const images = [jaguarImage, dolphinImage, canoeImage];
  return images[index % images.length];
};

export default function HomePage() {
  const [, setLocation] = useLocation();

  const { data: tours, isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/tours'));
      if (!response.ok) throw new Error('Failed to fetch tours');
      return response.json();
    },
  });

  const handleSearch = (destination: string) => {
    console.log('Search:', { destination });
    setLocation(`/tours?location=${destination}`);
  };

  const handleTourClick = (id: string) => {
    setLocation(`/tour/${id}`);
  };

  const featuredTours = tours?.slice(0, 6) || [];

  return (
    <div>
      <HeroSection backgroundImage={heroImage} onSearch={handleSearch} />

      <section className="bg-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">Our Amazing Destinations</h2>
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
            {isLoading ? (
              <div data-testid="loading-tours" className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Loading tours...</p>
              </div>
            ) : featuredTours.length > 0 ? (
              featuredTours.map((tour, index) => (
                <TourCard 
                  key={tour.id} 
                  id={tour.id}
                  image={getImageForTour(tour, index)}
                  title={tour.name}
                  description={tour.detalle || tour.description || ''}
                  duration={tour.duration || 'Various'}
                  difficulty="Moderate"
                  priceDisplay={getPriceDisplay(tour).text}
                  location={formatLocation(tour.location)}
                  rating={4.7}
                  reviews={50}
                  groupSize="2-6"
                  onClick={handleTourClick} 
                />
              ))
            ) : (
              <div data-testid="no-tours" className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No tours available at the moment.</p>
              </div>
            )}
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
