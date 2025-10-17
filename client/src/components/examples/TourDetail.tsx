import TourDetail from '../TourDetail';
import dolphinImage from '@assets/generated_images/Pink_dolphins_Amazon_sunset_d0aee95e.png';
import canoeImage from '@assets/generated_images/Canoe_Amazon_river_dawn_94feb359.png';

export default function TourDetailExample() {
  const mockTour = {
    id: "1",
    title: "Pink Dolphin River Adventure",
    description: "Experience the magic of the Amazon River with our exclusive pink dolphin tour. Watch these rare and beautiful creatures in their natural habitat during the golden hour. Our expert guides will share fascinating insights about the ecosystem and wildlife.",
    images: [dolphinImage, canoeImage, dolphinImage, canoeImage],
    duration: "3 days, 2 nights",
    difficulty: "Easy",
    priceDisplay: "$649",
    rating: 4.9,
    reviews: 187,
    groupSize: "Max 12 people",
    location: "Manaus, Brazil",
    included: [
      "Professional guide",
      "Accommodation in eco-lodge",
      "All meals included",
      "River transportation",
      "Wildlife spotting equipment",
      "Photography assistance"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival & Orientation",
        description: "Meet your guide in Manaus and transfer to the eco-lodge. Evening introduction to the river ecosystem and sunset dolphin spotting."
      },
      {
        day: 2,
        title: "Full Day River Exploration",
        description: "Dawn dolphin watching, canoe tour through flooded forest, visit local community, and night wildlife safari."
      },
      {
        day: 3,
        title: "Final Morning & Departure",
        description: "Early morning photography session with dolphins, breakfast at the lodge, and return transfer to Manaus."
      }
    ]
  };

  return (
    <TourDetail 
      tour={mockTour}
      onInquire={(id) => console.log('Inquire about tour:', id)}
    />
  );
}
