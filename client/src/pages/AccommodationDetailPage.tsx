import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Accommodation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GuestCounter from "@/components/GuestCounter";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Home, MapPin, Users, Wifi, Utensils, Calendar as CalendarIcon, ArrowLeft, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AccommodationDetailPage() {
  const [match, params] = useRoute("/accommodation/:id");
  const [, setLocation] = useLocation();
  const { addToCart } = useCart();

  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [guestCount, setGuestCount] = useState(1);

  const { data: accommodation, isLoading } = useQuery({
    queryKey: ["accommodation", params?.id],
    queryFn: async () => {
      const response = await fetch(`/api/accommodations/${params?.id}`);
      if (!response.ok) throw new Error("Failed to fetch accommodation");
      return response.json() as Promise<Accommodation>;
    },
    enabled: !!params?.id,
  });

  // Old direct booking mutation removed - rooms now go through cart like tours

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(parseInt(price) || 0);
  };

  const parseAmenities = (amenitiesStr: string | null) => {
    if (!amenitiesStr) return [];
    try {
      return JSON.parse(amenitiesStr);
    } catch {
      return [];
    }
  };

  const calculateTotalPrice = () => {
    if (!accommodation?.pricePerNight || !checkInDate || !checkOutDate) return 0;
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    return parseInt(accommodation.pricePerNight) * nights;
  };

  // Old direct handleBooking removed — rooms now use cart flow (same as tours)

  // New cart-first flow: Book room → add to cart → redirect to cart (to add more or pay now)
  const handleAddRoomToCart = () => {
    if (!accommodation || !checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates and number of guests");
      return;
    }

    const totalPrice = calculateTotalPrice();
    const checkInStr = checkInDate.toISOString().split('T')[0];
    const checkOutStr = checkOutDate.toISOString().split('T')[0];

    const cartItem = {
      id: `accommodation-${accommodation.id}-${Date.now()}`,
      type: 'accommodation' as const,
      name: accommodation.name,
      date: checkInStr,
      returnDate: checkOutStr,
      participants: guestCount,
      price: parseInt(accommodation.pricePerNight || '0'),
      totalPrice,
      details: {
        accommodationId: accommodation.id,
        // Personal info collected at the end on the cart page before payment
      },
    };

    addToCart(cartItem);
    setLocation('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!accommodation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accommodation not found</h1>
          <Button onClick={() => setLocation("/accommodations")}>
            Back to Accommodations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => setLocation("/accommodations")}
              className="hover:text-primary transition-colors"
            >
              Accommodations
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{accommodation.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-green-200 to-blue-200 rounded-lg mb-6 flex items-center justify-center">
              <span className="text-gray-500 text-lg">Accommodation Images</span>
            </div>

            {/* Accommodation Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{accommodation.name}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    {accommodation.location?.replace('-', ' ').toUpperCase()}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-2" />
                    Up to {accommodation.maxGuests} guests
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize text-lg px-3 py-1">
                  {accommodation.type}
                </Badge>
              </div>

              <p className="text-gray-700 text-lg mb-6">{accommodation.description}</p>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {parseAmenities(accommodation.amenities).map((amenity: string) => (
                    <Badge key={amenity} variant="outline" className="text-sm py-1 px-3">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-primary">
                {formatPrice(accommodation.pricePerNight || "0")}
                <span className="text-lg font-normal text-gray-600"> per night</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
                <CardDescription>
                  Fill in your details to reserve this accommodation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Check-in Date */}
                <div>
                  <Label htmlFor="checkin">Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !checkInDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checkInDate}
                        onSelect={setCheckInDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Check-out Date */}
                <div>
                  <Label htmlFor="checkout">Check-out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !checkOutDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={checkOutDate}
                        onSelect={setCheckOutDate}
                        disabled={(date) => date <= (checkInDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Guest Count */}
                <GuestCounter
                  value={guestCount}
                  onChange={setGuestCount}
                  min={1}
                  max={accommodation?.maxGuests || 10}
                  label="Number of Guests"
                />
 
                {/* Total Price */}
                {checkInDate && checkOutDate && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">
                        {formatPrice(calculateTotalPrice().toString())}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))} nights
                    </p>
                  </div>
                )}
 
                <Button
                  onClick={handleAddRoomToCart}
                  className="w-full"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  All personal information collected once on the cart page before payment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}