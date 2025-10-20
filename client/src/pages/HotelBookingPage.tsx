import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Home, Calendar, Users, MapPin, Wifi, Coffee, Car } from "lucide-react";

interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
  image: string;
  description: string;
}

export default function HotelBookingPage() {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [totalGuests, setTotalGuests] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<{[key: string]: number}>({});
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Sample rooms data (in a real app, this would come from an API)
  useEffect(() => {
    const sampleRooms: Room[] = [
      {
        id: 'dormitorio',
        name: 'Shared Dormitory',
        price: 50000,
        capacity: 1,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/DSCF0164-scaled.jpg',
        description: 'Shared dormitory with 4 beds'
      },
      {
        id: 'sencilla-pvt',
        name: 'Private Single Room',
        price: 70000,
        capacity: 1,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/DSCF0150-1-scaled.jpg',
        description: 'Private room for one person'
      },
      {
        id: 'matrimonial-deluxe',
        name: 'Deluxe Double Room',
        price: 120000,
        capacity: 2,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/IMG_20250427_105039882_HDR-1-scaled.jpg',
        description: 'Suite for 2 people'
      },
      {
        id: 'triple-familiar',
        name: 'Family Suite',
        price: 135000,
        capacity: 3,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/DSCF02342-1-scaled.jpg',
        description: 'Spacious suite for families'
      },
      {
        id: 'cuadruple-familiar',
        name: 'Family Suite Quad',
        price: 150000,
        capacity: 4,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/DSCF02342-1-scaled.jpg',
        description: 'Suite with queen bed + 2 single beds'
      },
      {
        id: 'matrimonial-hamaca',
        name: 'Double Room with River View & Hammock',
        price: 130000,
        capacity: 2,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/DSCF0202-1-scaled.jpg',
        description: 'The hotel\'s most exclusive suite'
      },
      {
        id: 'doble',
        name: 'Double Suite',
        price: 110000,
        capacity: 2,
        image: 'https://conexion-amazonas.com/wp-content/uploads/2025/05/DSCF02382-scaled.jpg',
        description: 'Suite with two single beds'
      }
    ];
    setRooms(sampleRooms);
  }, []);

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    const nights = calculateNights();
    let total = 0;
    Object.entries(selectedRooms).forEach(([roomId, quantity]) => {
      const room = rooms.find(r => r.id === roomId);
      if (room && quantity > 0) {
        total += room.price * quantity * nights;
      }
    });
    return total;
  };

  const calculateSelectedGuests = () => {
    let total = 0;
    Object.entries(selectedRooms).forEach(([roomId, quantity]) => {
      const room = rooms.find(r => r.id === roomId);
      if (room && quantity > 0) {
        total += room.capacity * quantity;
      }
    });
    return total;
  };

  const handleRoomQuantityChange = (roomId: string, quantity: number) => {
    const newSelectedRooms = { ...selectedRooms };
    if (quantity > 0) {
      newSelectedRooms[roomId] = quantity;
    } else {
      delete newSelectedRooms[roomId];
    }
    setSelectedRooms(newSelectedRooms);

    // Show booking form if we have enough rooms for guests
    const selectedGuests = calculateSelectedGuests();
    if (selectedGuests >= totalGuests && Object.keys(newSelectedRooms).length > 0) {
      setShowBookingForm(true);
    } else {
      setShowBookingForm(false);
    }
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates");
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      alert("Check-out date must be after check-in date");
      return;
    }
    // Scroll to rooms section
    document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalPrice = calculateTotalPrice();
    const selectedGuests = calculateSelectedGuests();

    if (selectedGuests < totalGuests) {
      alert(`You need rooms for ${totalGuests} guests but only have capacity for ${selectedGuests}`);
      return;
    }

    // Create booking data
    const bookingData = {
      guestName,
      guestEmail,
      guestCount: selectedGuests,
      checkInDate,
      checkOutDate,
      accommodationId: Object.keys(selectedRooms)[0], // Use first selected room for simplicity
      totalPrice,
    };

    try {
      const response = await fetch('/api/create-accommodation-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
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
            <span className="text-gray-900 font-medium">Hotel Booking</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hotel Booking
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience authentic Amazon hospitality in our riverside lodge
          </p>
        </div>

        {/* Date Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Select Your Dates
            </CardTitle>
            <CardDescription>
              Choose your check-in and check-out dates to see available rooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDateSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="checkin">Check-in Date</Label>
                <Input
                  id="checkin"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkout">Check-out Date</Label>
                <Input
                  id="checkout"
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="20"
                  value={totalGuests}
                  onChange={(e) => setTotalGuests(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  Check Availability
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Rooms Section */}
        {checkInDate && checkOutDate && (
          <div id="rooms-section">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {rooms.map((room) => (
                <Card key={room.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-gray-500">Image not available</span>';
                      }}
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                    <p className="text-gray-600 mb-3">{room.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(room.price)}
                      </span>
                      <span className="text-sm text-gray-600">per night</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Users className="w-4 h-4 mr-1" />
                      Up to {room.capacity} guests
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Quantity:</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoomQuantityChange(room.id, (selectedRooms[room.id] || 0) - 1)}
                          disabled={(selectedRooms[room.id] || 0) <= 0}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{selectedRooms[room.id] || 0}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoomQuantityChange(room.id, (selectedRooms[room.id] || 0) + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selection Summary */}
            {Object.keys(selectedRooms).length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Selection Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Selected Guests</p>
                      <p className="text-2xl font-bold">{calculateSelectedGuests()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nights</p>
                      <p className="text-2xl font-bold">{calculateNights()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Price</p>
                      <p className="text-2xl font-bold text-primary">{formatPrice(calculateTotalPrice())}</p>
                    </div>
                  </div>

                  {calculateSelectedGuests() < totalGuests && (
                    <p className="text-red-600 text-sm">
                      ⚠️ You need rooms for {totalGuests} guests but only have capacity for {calculateSelectedGuests()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Booking Form */}
        {showBookingForm && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Booking</CardTitle>
              <CardDescription>
                Please provide your details to complete the reservation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
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
                    <span className="text-primary">{formatPrice(calculateTotalPrice())}</span>
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Proceed to Payment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}