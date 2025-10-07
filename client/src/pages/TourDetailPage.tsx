import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import TourDetail from "@/components/TourDetail";
import ReviewCard from "@/components/ReviewCard";
import type { Tour } from "@shared/schema";
import { getPriceDisplay, formatLocation } from "@/lib/tourUtils";
import dolphinImage from '@assets/generated_images/Pink_dolphins_Amazon_sunset_d0aee95e.png';
import canoeImage from '@assets/generated_images/Canoe_Amazon_river_dawn_94feb359.png';
import macawImage from '@assets/generated_images/Macaws_Amazon_rainforest_birds_fd5ba5b5.png';
import jaguarImage from '@assets/generated_images/Amazon_jaguar_wildlife_encounter_30857d91.png';

function convertTourToDisplayFormat(tour: Tour) {
  const images = [jaguarImage, dolphinImage, canoeImage, macawImage];
  const priceInfo = getPriceDisplay(tour);

  return {
    id: tour.id,
    title: tour.name,
    description: tour.description || tour.detalle || '',
    images: images,
    duration: tour.duration ? `${tour.duration} hours` : 'Various',
    difficulty: 'Moderate',
    priceDisplay: priceInfo.text,
    rating: 4.7,
    reviews: 50,
    groupSize: '2-6 people',
    location: formatLocation(tour.location, true),
    included: [
      "Professional guide",
      "Transportation",
      "Equipment included",
      "Insurance coverage"
    ],
    itinerary: []
  };
}

//todo: remove mock functionality
const reviews = [
  {
    author: "Sarah Martinez",
    rating: 5,
    date: "2 weeks ago",
    tourName: "Wildlife Expedition",
    comment: "An absolutely incredible experience! Our guide was knowledgeable and passionate about the rainforest. We saw jaguars, macaws, and even pink dolphins. The eco-lodge was comfortable and the food was amazing. Highly recommend!"
  },
  {
    author: "James Chen",
    rating: 5,
    date: "1 month ago",
    tourName: "Pink Dolphin Adventure",
    comment: "The highlight of our South America trip! Watching pink dolphins at sunset was magical. Our guide shared so many fascinating facts about the ecosystem. Perfect for families - my kids still talk about it!"
  },
  {
    author: "Emma Thompson",
    rating: 4,
    date: "3 weeks ago",
    tourName: "Wildlife Expedition",
    comment: "Challenging but rewarding trek through pristine rainforest. Didn't see a jaguar but the overall wildlife experience was phenomenal. Great photography opportunities and excellent guides."
  }
];

export default function TourDetailPage() {
  const [match, params] = useRoute("/tour/:id");
  const tourId = params?.id || "";

  const { data: tour, isLoading, error } = useQuery<Tour>({
    queryKey: ['/api/tours', tourId],
    queryFn: async () => {
      const response = await fetch(`/api/tours/${tourId}`);
      if (!response.ok) throw new Error('Failed to fetch tour');
      return response.json();
    },
    enabled: !!tourId,
  });

  const handleInquire = (tourId: string) => {
    console.log('Inquiry for tour:', tourId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center" data-testid="loading-tour">
          <p className="text-muted-foreground">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center" data-testid="error-tour">
          <h1 className="font-serif text-3xl font-bold mb-4">Tour Not Found</h1>
          <p className="text-muted-foreground">The tour you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const displayTour = convertTourToDisplayFormat(tour);

  return (
    <div className="min-h-screen">
      <Navigation />
      <TourDetail tour={displayTour} onInquire={handleInquire} />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="font-serif text-3xl font-bold mb-8">What Our Guests Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <ReviewCard key={i} {...review} />
          ))}
        </div>
      </section>
    </div>
  );
}
