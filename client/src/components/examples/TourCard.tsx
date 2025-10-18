import TourCard from '../TourCard';
import jaguarImage from '@assets/generated_images/Amazon_jaguar_wildlife_encounter_30857d91.png';

export default function TourCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <TourCard
        id="1"
        image={jaguarImage}
        title="Wildlife Expedition: Jaguar Tracking"
        description="Track the elusive jaguar through dense rainforest with expert guides"
        duration="5 days"
        difficulty="Challenging"
        priceDisplay="$899"
        rating={4.8}
        reviews={124}
        groupSize="Max 8"
        onClick={(id) => console.log('Tour clicked:', id)}
      />
    </div>
  );
}
