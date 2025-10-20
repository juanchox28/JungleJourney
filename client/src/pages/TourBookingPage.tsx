import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Home, Calendar, Users, MapPin, Clock, Star } from "lucide-react";
import { Tour } from "@shared/schema";
import { getPriceDisplay, formatLocation } from "@/lib/tourUtils";

export default function TourBookingPage() {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [tourDate, setTourDate] = useState("");
  const [participantCount, setParticipantCount] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const { data: tours = [], isLoading } = useQuery({
    queryKey: ["tours"],
    queryFn: async () => {
      const response = await fetch("/api/tours");
      if (!response.ok) throw new Error("Failed to fetch tours");
      return response.json() as Promise<Tour[]>;
    },
  });

  const calculateTourPrice = () => {
    if (!selectedTour) return 0;
    const priceInfo = getPriceDisplay(selectedTour);
    return priceInfo.value * participantCount;
  };

  const handleTourBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTour || !tourDate || !guestName || !guestEmail) {
      alert("Please fill in all required fields");
      return;
    }

    const totalPrice = calculateTourPrice();

    try {
      const response = await fetch('/api/create-tour-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName,
          guestEmail,
          guestCount: participantCount,
          tourDate,
          tourId: selectedTour.id,
          totalPrice,
        }),
      });

      const data = await response.json();

      if (data.ok && data.checkout_url) {
        // Redirect to Wompi payment page
        window.location.href = data.checkout_url;
      } else {
        alert('Error creating booking: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Error creating booking. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="flex items-center hover:text-primary transition-colors">
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Tour Booking</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tour Booking
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the Amazon rainforest with our expert-guided tours
          </p>
        </div>

        {/* Tour Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Select Your Tour
            </CardTitle>
            <CardDescription>
              Choose from our available Amazon tours and adventures
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading tours...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tours.map((tour) => (
                  <div
                    key={tour.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTour?.id === tour.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTour(tour)}
                  >
                    <div className="aspect-video bg-gradient-to-br from-green-200 to-blue-200 rounded mb-3 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Tour Image</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{tour.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {tour.description || tour.detalle || 'Experience the Amazon rainforest'}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-primary">
                        {getPriceDisplay(tour).text}
                      </span>
                      <Badge variant="secondary">
                        {formatLocation(tour.location)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {tour.duration ? `${tour.duration} hours` : 'Various duration'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Form */}
        {selectedTour && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tour Details */}
            <Card>
              <CardHeader>
                <CardTitle>{selectedTour.name}</CardTitle>
                <CardDescription>
                  {selectedTour.description || selectedTour.detalle || 'Experience the Amazon rainforest'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{formatLocation(selectedTour.location, true)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{selectedTour.duration ? `${selectedTour.duration} hours` : 'Various duration'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-2" />
                    <span>Group size: {selectedTour.category || 'Small groups'}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Price per person:</span>
                      <span className="text-xl font-bold text-primary">
                        {getPriceDisplay(selectedTour).text}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle>Book Your Tour</CardTitle>
                <CardDescription>
                  Complete your reservation details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTourBooking} className="space-y-4">
                  <div>
                    <Label htmlFor="tour-date">Tour Date *</Label>
                    <Input
                      id="tour-date"
                      type="date"
                      value={tourDate}
                      onChange={(e) => setTourDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="participants">Number of Participants *</Label>
                    <Input
                      id="participants"
                      type="number"
                      min="1"
                      max="20"
                      value={participantCount}
                      onChange={(e) => setParticipantCount(parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guest-name">Full Name *</Label>
                      <Input
                        id="guest-name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="guest-email">Email Address *</Label>
                      <Input
                        id="guest-email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="special-requests">Special Requests</Label>
                    <Textarea
                      id="special-requests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requirements or notes..."
                      rows={3}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold mb-4">
                      <span>Total Amount:</span>
                      <span className="text-primary">{formatPrice(calculateTourPrice())}</span>
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      Book Tour Now
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {tours.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No tours available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}