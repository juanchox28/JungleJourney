import { useRoute } from "wouter";
import Navigation from "@/components/Navigation";
import TourDetail from "@/components/TourDetail";
import ReviewCard from "@/components/ReviewCard";
import dolphinImage from '@assets/generated_images/Pink_dolphins_Amazon_sunset_d0aee95e.png';
import canoeImage from '@assets/generated_images/Canoe_Amazon_river_dawn_94feb359.png';
import macawImage from '@assets/generated_images/Macaws_Amazon_rainforest_birds_fd5ba5b5.png';
import jaguarImage from '@assets/generated_images/Amazon_jaguar_wildlife_encounter_30857d91.png';

//todo: remove mock functionality
const tourData: Record<string, any> = {
  "1": {
    id: "1",
    title: "Wildlife Expedition: Jaguar Tracking",
    description: "Embark on an unforgettable journey deep into the Amazon rainforest to track the elusive jaguar. This challenging expedition takes you through pristine jungle terrain where few tourists venture. Our expert guides, who have spent decades studying these magnificent cats, will help you understand jaguar behavior, identify tracks, and maximize your chances of a sighting. Beyond jaguars, you'll encounter countless other species including monkeys, birds, and reptiles. This is a true wilderness adventure for those seeking an authentic rainforest experience.",
    images: [jaguarImage, canoeImage, macawImage, dolphinImage],
    duration: "5 days, 4 nights",
    difficulty: "Challenging",
    price: 899,
    rating: 4.8,
    reviews: 124,
    groupSize: "Max 8 people",
    location: "Manaus, Brazil",
    included: [
      "Professional wildlife guide",
      "Eco-lodge accommodation",
      "All meals and snacks",
      "Tracking equipment",
      "Night vision cameras",
      "Insurance coverage"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival & Jungle Orientation",
        description: "Transfer from Manaus to our base camp deep in the jungle. Evening orientation on jaguar behavior and safety protocols."
      },
      {
        day: 2,
        title: "First Tracking Expedition",
        description: "Dawn trek to known jaguar territories. Learn to identify tracks, scat, and territory markings. Afternoon wildlife observation."
      },
      {
        day: 3,
        title: "Deep Jungle Trek",
        description: "Full day expedition to remote areas. Set up camera traps and conduct systematic wildlife surveys."
      },
      {
        day: 4,
        title: "River & Forest Combination",
        description: "Morning canoe safari, afternoon jungle tracking. Night safari to observe nocturnal predators."
      },
      {
        day: 5,
        title: "Final Tracking & Departure",
        description: "Early morning final tracking session, review camera trap footage, and return transfer to Manaus."
      }
    ]
  },
  "2": {
    id: "2",
    title: "Pink Dolphin River Adventure",
    description: "Experience the magic of the Amazon River with our exclusive pink dolphin tour. Watch these rare and beautiful creatures in their natural habitat during the golden hour. Our expert guides will share fascinating insights about the ecosystem and wildlife. This gentle adventure is perfect for families and nature lovers of all ages.",
    images: [dolphinImage, canoeImage, macawImage, jaguarImage],
    duration: "3 days, 2 nights",
    difficulty: "Easy",
    price: 649,
    rating: 4.9,
    reviews: 187,
    groupSize: "Max 12 people",
    location: "Manaus, Brazil",
    included: [
      "Professional river guide",
      "Riverside lodge stay",
      "All meals included",
      "Boat transportation",
      "Photography equipment",
      "Dolphin interaction permits"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival & River Introduction",
        description: "Meet your guide and transfer to riverside lodge. Sunset dolphin spotting from traditional canoe."
      },
      {
        day: 2,
        title: "Full Day River Exploration",
        description: "Dawn dolphin photography session, canoe through flooded forest, visit local community, night river safari."
      },
      {
        day: 3,
        title: "Final Morning & Return",
        description: "Early morning dolphin encounter, breakfast at lodge, return transfer to Manaus with photo memories."
      }
    ]
  }
};

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
  const tourId = params?.id || "1";
  const tour = tourData[tourId] || tourData["1"];

  const handleBook = (tourId: string, date: string, guests: number) => {
    console.log('Booking tour:', { tourId, date, guests });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <TourDetail tour={tour} onBook={handleBook} />
      
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
