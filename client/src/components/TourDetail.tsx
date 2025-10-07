import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, MapPin, Check, Calendar } from "lucide-react";
import { useState } from "react";

interface TourDetailProps {
  tour: {
    id: string;
    title: string;
    description: string;
    images: string[];
    duration: string;
    difficulty: string;
    price: number;
    rating: number;
    reviews: number;
    groupSize: string;
    location: string;
    included: string[];
    itinerary: { day: number; title: string; description: string }[];
  };
  onBook?: (tourId: string, date: string, guests: number) => void;
}

export default function TourDetail({ tour, onBook }: TourDetailProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [guests, setGuests] = useState(2);

  const handleBook = () => {
    onBook?.(tour.id, selectedDate, guests);
    console.log('Booking:', { tourId: tour.id, date: selectedDate, guests });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
        <div className="lg:col-span-3">
          <div className="aspect-video rounded-2xl overflow-hidden mb-4">
            <img 
              src={tour.images[0]} 
              alt={tour.title}
              className="w-full h-full object-cover"
            />
          </div>
          {tour.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {tour.images.slice(1).map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                  <span className="font-semibold">{tour.rating}</span>
                  <span className="text-sm text-muted-foreground">({tour.reviews} reviews)</span>
                </div>
                <Badge>{tour.difficulty}</Badge>
              </div>

              <h1 className="font-serif text-3xl font-bold mb-4">{tour.title}</h1>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{tour.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{tour.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{tour.groupSize}</span>
                </div>
              </div>

              <div className="border-t border-border pt-6 mb-6">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">${tour.price}</span>
                  <span className="text-muted-foreground">per person</span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input
                      data-testid="input-booking-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Guests</label>
                    <input
                      data-testid="input-booking-guests"
                      type="number"
                      min="1"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                </div>

                <Button 
                  data-testid="button-book-tour"
                  onClick={handleBook}
                  className="w-full"
                  size="lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">About This Tour</h2>
            <p className="text-muted-foreground leading-relaxed">{tour.description}</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">What's Included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tour.included.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-6">Itinerary</h2>
            <div className="space-y-4">
              {tour.itinerary.map((day) => (
                <Card key={day.day}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">Day {day.day}: {day.title}</h3>
                    <p className="text-muted-foreground">{day.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
