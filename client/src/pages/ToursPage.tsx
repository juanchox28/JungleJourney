import { useState } from "react";
import { useLocation } from "wouter";
import FilterBar from "@/components/FilterBar";
import TourCard from "@/components/TourCard";
import Navigation from "@/components/Navigation";
import jaguarImage from '@assets/generated_images/Amazon_jaguar_wildlife_encounter_30857d91.png';
import dolphinImage from '@assets/generated_images/Pink_dolphins_Amazon_sunset_d0aee95e.png';
import canoeImage from '@assets/generated_images/Canoe_Amazon_river_dawn_94feb359.png';
import macawImage from '@assets/generated_images/Macaws_Amazon_rainforest_birds_fd5ba5b5.png';
import canopyImage from '@assets/generated_images/Canopy_walkway_adventure_Amazon_06cf19ac.png';

//todo: remove mock functionality
const allTours = [
  {
    id: "1",
    image: jaguarImage,
    title: "Wildlife Expedition: Jaguar Tracking",
    description: "Track the elusive jaguar through dense rainforest with expert guides and witness the Amazon's apex predator.",
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
    description: "Experience the magic of the Amazon River and encounter the rare pink river dolphins.",
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
    description: "Navigate peaceful tributaries in traditional canoes, discovering hidden wildlife.",
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
    description: "Spot over 300 species of colorful birds including macaws and toucans.",
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
    description: "Walk among the treetops on suspended bridges and experience the rainforest from above.",
    duration: "2 days",
    difficulty: "Moderate" as const,
    price: 449,
    rating: 4.6,
    reviews: 76,
    groupSize: "Max 12"
  },
  {
    id: "6",
    image: dolphinImage,
    title: "Amazon River Cruise",
    description: "Multi-day luxury river cruise exploring the heart of the Amazon.",
    duration: "7 days",
    difficulty: "Easy" as const,
    price: 1299,
    rating: 4.9,
    reviews: 231,
    groupSize: "Max 20"
  },
  {
    id: "7",
    image: jaguarImage,
    title: "Night Safari Experience",
    description: "Discover the Amazon's nocturnal wildlife with expert guides.",
    duration: "1 day",
    difficulty: "Easy" as const,
    price: 199,
    rating: 4.9,
    reviews: 201,
    groupSize: "Max 8"
  },
  {
    id: "8",
    image: canoeImage,
    title: "Indigenous Community Experience",
    description: "Live with indigenous communities and learn traditional ways of life.",
    duration: "6 days",
    difficulty: "Moderate" as const,
    price: 849,
    rating: 4.7,
    reviews: 89,
    groupSize: "Max 6"
  }
];

export default function ToursPage() {
  const [, setLocation] = useLocation();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

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
          <p className="text-sm text-muted-foreground">
            Showing {allTours.length} tours
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allTours.map((tour) => (
            <TourCard key={tour.id} {...tour} onClick={handleTourClick} />
          ))}
        </div>
      </div>
    </div>
  );
}
