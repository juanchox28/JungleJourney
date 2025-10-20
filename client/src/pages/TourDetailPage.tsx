import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import TourDetail from "@/components/TourDetail";
import { getApiUrl } from "@/lib/utils";
import ReviewCard from "@/components/ReviewCard";
import type { Tour } from "@shared/schema";
import { getPriceDisplay, formatLocation } from "@/lib/tourUtils";
import { Home, ArrowLeft, Calendar, Users, Mail, User } from "lucide-react";
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
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const { data: tour, isLoading, error } = useQuery<Tour>({
    queryKey: ['/api/tours', tourId],
    queryFn: async () => {
      const response = await fetch(getApiUrl(`/api/tours/${tourId}`));
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

  const handleTourBooking = () => {
    if (!tour || !tourDate || !guestName || !guestEmail) {
      alert("Please fill in all required fields");
      return;
    }

    const totalPrice = calculateTourPrice();

    // Use the new tour booking endpoint
    fetch('/api/create-tour-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guestName,
        guestEmail,
        guestCount,
        tourDate: tourDate.toISOString().split('T')[0],
        tourId: tour.id,
        totalPrice,
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.ok && data.checkout_url) {
        // Redirect to Wompi payment page
        window.location.href = data.checkout_url;
      } else {
        alert('Error creating booking: ' + (data.error || 'Unknown error'));
      }
    })
    .catch(error => {
      console.error('Booking error:', error);
      alert('Error creating booking. Please try again.');
    });
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
                {/* Tour Date */}
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

                {/* Guest Count */}
                <div>
                  <Label htmlFor="guests">Number of Participants *</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="10"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  />
                </div>

                {/* Guest Name */}
                <div>
                  <Label htmlFor="guest-name">Full Name *</Label>
                  <Input
                    id="guest-name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Guest Email */}
                <div>
                  <Label htmlFor="guest-email">Email Address *</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                {/* Special Requests */}
                <div>
                  <Label htmlFor="requests">Special Requests</Label>
                  <Textarea
                    id="requests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                  />
                </div>

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

                <Button
                  onClick={handleTourBooking}
                  className="w-full"
                  size="lg"
                >
                  Book Tour Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
