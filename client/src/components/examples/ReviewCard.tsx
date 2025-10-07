import ReviewCard from '../ReviewCard';

export default function ReviewCardExample() {
  return (
    <div className="p-8 max-w-2xl">
      <ReviewCard
        author="Sarah Martinez"
        rating={5}
        date="2 weeks ago"
        tourName="Wildlife Expedition"
        comment="An absolutely incredible experience! Our guide was knowledgeable and passionate about the rainforest. We saw jaguars, macaws, and even pink dolphins. The eco-lodge was comfortable and the food was amazing. Highly recommend!"
      />
    </div>
  );
}
