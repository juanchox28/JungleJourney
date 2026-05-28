import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import TourDetail from "@/components/TourDetail";
import GuestCounter from "@/components/GuestCounter";
import { useCart } from "@/lib/cartContext";

import ReviewCard from "@/components/ReviewCard";
import type { Tour } from "@shared/schema";
import { getPriceDisplay, formatLocation } from "@/lib/tourUtils";
import { Home, ArrowLeft, Calendar, Users, Mail, User, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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

  const [tourDate, setTourDate] = useState<Date>();
  const [guestCount, setGuestCount] = useState(1);

  const { addToCart, getTotalItems } = useCart();
  const [, setLocation] = useLocation();

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

  const calculateTourPrice = () => {
    if (!tour) return 0;
    const priceInfo = getPriceDisplay(tour);
    return priceInfo.value * guestCount;
  };

  const handleAddToCart = () => {
    if (!tour || !tourDate) {
      alert("Please select a date and number of participants");
      return;
    }

    // Check advance booking time (same logic as direct book)
    const bookingAdvanceHours = (tour as any).bookingAdvanceHours ?? 24;
    const selectedDateTime = new Date(tourDate);
    const now = new Date();
    const hoursDifference = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < bookingAdvanceHours) {
      alert(`This tour requires booking at least ${bookingAdvanceHours} hours in advance. Please select a later date.`);
      return;
    }

    const totalPrice = calculateTourPrice();
    const dateStr = tourDate.toISOString().split('T')[0];

    // Lightweight cart item — personal info & extras collected later on the cart page before payment
    const cartItem = {
      id: `tour-${tour.id}-${Date.now()}`,
      type: 'tour' as const,
      name: tour.name,
      date: dateStr,
      participants: guestCount,
      price: getPriceDisplay(tour).value,
      totalPrice,
      details: {
        tourId: tour.id,
        // Personal info (name, email, footSize, dietary, specialRequests) will be collected on the cart/checkout page
      },
    };

    addToCart(cartItem);

    // Redirect to cart — all personal information asked once at the end before payment
    setLocation('/checkout');
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
      {/* Breadcrumb Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="flex items-center hover:text-primary transition-colors">
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
            <span>/</span>
            <Link href="/tours" className="hover:text-primary transition-colors">
              Tours
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{tour.name}</span>
          </nav>
        </div>
      </div>

      <Navigation />
      <TourDetail tour={displayTour} onInquire={handleInquire} />

      {/* Tour Booking Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reviews Section */}
          <div>
            <h2 className="font-serif text-3xl font-bold mb-8">What Our Guests Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review, i) => (
                <ReviewCard key={i} {...review} />
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book This Tour</CardTitle>
                <CardDescription>
                  Reserve your spot for this amazing Amazon adventure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tour Date - only dates and people at selection time */}
                <div>
                  <Label htmlFor="tour-date">Tour Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tourDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {tourDate ? format(tourDate, "PPP") : "Select tour date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={tourDate}
                        onSelect={setTourDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
 
                {/* Number of Participants */}
                <GuestCounter
                  value={guestCount}
                  onChange={setGuestCount}
                  min={1}
                  max={10}
                  label="Number of Participants *"
                />
 
                {/* Price Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold mb-2">
                    <span>Price per person:</span>
                    <span className="text-primary">{getPriceDisplay(tour).text}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total ({guestCount} {guestCount === 1 ? 'person' : 'people'}):</span>
                    <span className="text-primary">${calculateTourPrice().toLocaleString()}</span>
                  </div>
                </div>
 
                <div className="pt-2">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    All personal information and extra details (name, email, foot size, dietary, special requests) will be collected once on the cart page before payment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
