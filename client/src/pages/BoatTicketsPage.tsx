import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, MapPin, Clock, Users, Calendar, ArrowRight } from "lucide-react";

const boatRoutes = [
  {
    id: "leticia-puerto-narino",
    from: "Leticia",
    to: "Puerto Nariño",
    duration: "2 hours",
    price: 90000,
    schedule: ["7:00 AM", "9:00 AM", "12:00 PM", "2:00 PM"],
    description: "Scenic river journey through the Amazon"
  },
  {
    id: "puerto-narino-leticia",
    from: "Puerto Nariño",
    to: "Leticia",
    duration: "2 hours",
    price: 90000,
    schedule: ["8:00 AM", "10:00 AM", "1:00 PM", "3:00 PM"],
    description: "Return journey with river views"
  },
  {
    id: "leticia-mocagua",
    from: "Leticia",
    to: "Mocagua",
    duration: "3 hours",
    price: 120000,
    schedule: ["6:00 AM", "11:00 AM"],
    description: "Extended journey to the wildlife sanctuary"
  },
  {
    id: "mocagua-leticia",
    from: "Mocagua",
    to: "Leticia",
    duration: "3 hours",
    price: 120000,
    schedule: ["7:00 AM", "12:00 PM"],
    description: "Return from the primate sanctuary"
  }
];

export default function BoatTicketsPage() {
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [travelDate, setTravelDate] = useState("");

  const selectedRouteData = boatRoutes.find(route => route.id === selectedRoute);
  const availableTimes = selectedRouteData?.schedule || [];

  const calculateTotal = () => {
    if (!selectedRouteData) return 0;
    return selectedRouteData.price * passengerCount;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleBooking = () => {
    if (!selectedRoute || !selectedTime || !travelDate) {
      alert("Please fill in all required fields");
      return;
    }

    // For now, just show a success message
    // In a real implementation, this would integrate with payment
    alert(`Boat ticket booked successfully!\nRoute: ${selectedRouteData?.from} → ${selectedRouteData?.to}\nTime: ${selectedTime}\nDate: ${travelDate}\nPassengers: ${passengerCount}\nTotal: ${formatPrice(calculateTotal())}`);
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
            <span className="text-gray-900 font-medium">River Boat Tickets</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            River Boat Tickets
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Travel between Amazon destinations with our comfortable river transportation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Routes Selection */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Available Routes</h2>
            <div className="space-y-4">
              {boatRoutes.map((route) => (
                <Card
                  key={route.id}
                  className={`cursor-pointer transition-all ${
                    selectedRoute === route.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedRoute(route.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="font-semibold text-lg">{route.from}</div>
                          <div className="text-sm text-gray-500">Departure</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="text-center">
                          <div className="font-semibold text-lg">{route.to}</div>
                          <div className="text-sm text-gray-500">Arrival</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg font-bold">
                        {formatPrice(route.price)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {route.duration}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Multiple departures daily
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{route.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {route.schedule.map((time) => (
                        <Badge key={time} variant="outline" className="text-xs">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book Your River Journey</CardTitle>
                <CardDescription>
                  Select your travel details and complete your booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route Selection */}
                <div>
                  <Label htmlFor="route">Select Route</Label>
                  <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your route" />
                    </SelectTrigger>
                    <SelectContent>
                      {boatRoutes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.from} → {route.to}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Travel Date */}
                <div>
                  <Label htmlFor="date">Travel Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Departure Time */}
                {selectedRoute && (
                  <div>
                    <Label htmlFor="time">Departure Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select departure time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Passenger Count */}
                <div>
                  <Label htmlFor="passengers">Number of Passengers</Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max="20"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                  />
                </div>

                {/* Route Info */}
                {selectedRouteData && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Route Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Route:</span>
                        <span>{selectedRouteData.from} → {selectedRouteData.to}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{selectedRouteData.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price per person:</span>
                        <span>{formatPrice(selectedRouteData.price)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Price */}
                {selectedRoute && travelDate && selectedTime && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">{formatPrice(calculateTotal())}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {passengerCount} passenger{passengerCount > 1 ? 's' : ''} × {formatPrice(selectedRouteData?.price || 0)}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleBooking}
                  className="w-full"
                  disabled={!selectedRoute || !travelDate || !selectedTime}
                >
                  Book River Boat Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}