import { useState, useMemo } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import FilterBar from "@/components/FilterBar";
import TourCard from "@/components/TourCard";
import Navigation from "@/components/Navigation";
import type { Tour } from "@shared/schema";
import { formatLocation, getPriceDisplay } from "@/lib/tourUtils";
import { getApiUrl } from "@/lib/utils";
import { Home } from "lucide-react";
import jaguarImage from '@assets/generated_images/Amazon_jaguar_wildlife_encounter_30857d91.png';
import dolphinImage from '@assets/generated_images/Pink_dolphins_Amazon_sunset_d0aee95e.png';
import canoeImage from '@assets/generated_images/Canoe_Amazon_river_dawn_94feb359.png';

const getImageForTour = (tour: Tour, index: number) => {
  const images = [jaguarImage, dolphinImage, canoeImage];
  return images[index % images.length];
};

export default function ToursPage() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const urlParams = useMemo(() => new URLSearchParams(searchParams), [searchParams]);
  const locationFilter = urlParams.get('location') || undefined;

  const { data: tours, isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours', locationFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationFilter) {
        params.set('location', locationFilter);
      }
      const response = await fetch(getApiUrl(`/api/tours?${params}`));
      if (!response.ok) throw new Error('Failed to fetch tours');
      return response.json();
    },
  });

  const handleTourClick = (id: string) => {
    setLocation(`/tour/${id}`);
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="flex items-center hover:text-primary transition-colors">
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Tours</span>
          </nav>
        </div>
      </div>

      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-4">Explore Amazon Tours</h1>
          <p className="text-xl text-muted-foreground">
            Find your perfect rainforest adventure
          </p>
        </div>

        <div className="mb-8">
          <FilterBar onFilterChange={setSelectedFilters} />
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground" data-testid="text-tour-count">
            {isLoading ? 'Loading tours...' : `Showing ${tours?.length || 0} tours`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div data-testid="loading-tours" className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading tours...</p>
            </div>
          ) : tours && tours.length > 0 ? (
            tours.map((tour, index) => (
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
              <p className="text-muted-foreground">No tours available for the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
