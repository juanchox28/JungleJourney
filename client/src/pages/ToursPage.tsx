import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import FilterBar from "@/components/FilterBar";
import TourCard from "@/components/TourCard";
import Navigation from "@/components/Navigation";
import type { Tour } from "@shared/schema";
import { formatLocation, getPriceDisplay } from "@/lib/tourUtils";
import { getApiUrl } from "@/lib/utils";
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
