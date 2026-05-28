import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Accommodation } from "@shared/schema";
import { useCart } from "@/lib/cartContext";

// Helper function to format date string without timezone issues
const formatDateString = (dateString: string) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  // Using UTC to prevent timezone shifts. The user selects a "day", not a "time".
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC' // Ensure the output is based on UTC
  });
};
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Home, Calendar, Users, MapPin, Wifi, Coffee, Car, Minus, Plus, ShoppingCart } from "lucide-react";
import Navigation from "@/components/Navigation";

interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
  image: string;
  description: string;
}

export default function HotelBookingPage() {
  const [checkInDate, setCheckInDate] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("checkIn") || "";
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("checkOut") || "";
  });
  const [totalGuests, setTotalGuests] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("guests") || "1", 10);
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<{ [key: string]: number }>({});
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('cash');
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const { addToCart } = useCart();
  const [, setLocation] = useLocation();

  // Add page-specific schema markup
  useEffect(() => {
    // Add structured data for hotel booking page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Hotel Booking - Paraíso Ayahuasca",
      "description": "Book accommodations at Paraíso Ayahuasca Hotels & Tours in Leticia and Puerto Nariño, Amazonas Colombia",
      "url": "https://paraisoayahuasca.com/hotel-booking",
      "mainEntity": {
        "@type": "LodgingBusiness",
        "name": "Paraíso Ayahuasca Lodge",
        "description": "Riverside lodge offering authentic Amazonian hospitality with traditional ceremonies",
        "address": {
          "@type": "PostalAddress",
          "addressRegion": "Amazonas",
          "addressCountry": "Colombia"
        },
        "priceRange": "$$",
        "amenityFeature": [
          {
            "@type": "LocationFeatureSpecification",
            "name": "Riverside Location",
            "value": "true"
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Traditional Ceremonies",
            "value": "true"
          }
        ]
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://paraisoayahuasca.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Hotel Booking",
            "item": "https://paraisoayahuasca.com/hotel-booking"
          }
        ]
      }
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Fetch accommodations from API
  const { data: accommodations = [], isLoading } = useQuery({
    queryKey: ["accommodations"],
    queryFn: async () => {
      const response = await fetch('/api/accommodations');
      if (!response.ok) throw new Error("Failed to fetch accommodations");
      return response.json() as Promise<Accommodation[]>;
    },
  });

  // Map API data to Room interface
  useEffect(() => {
    if (accommodations.length > 0) {
      const mappedRooms: Room[] = accommodations.map(acc => {
        // Parse images safely
        let image = 'https://placehold.co/600x400?text=No+Image';
        try {
          const images = JSON.parse(acc.images as string);
          if (Array.isArray(images) && images.length > 0) {
            image = images[0];
          }
        } catch (e) {
          console.error('Error parsing images for accommodation:', acc.id);
        }

        return {
          id: acc.id,
          name: acc.name,
          price: Number(acc.pricePerNight),
          capacity: acc.maxGuests || 2,
          image: image,
          description: acc.description || ''
        };
      });
      setRooms(mappedRooms);
    }
  }, [accommodations]);

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
    // Prevent adding more rooms than needed for total guests
    const currentSelectedGuests = Object.entries(selectedRooms).reduce((total, [rId, qty]) => {
      if (rId !== roomId) { // Exclude current room being modified
        const room = rooms.find(r => r.id === rId);
        if (room && qty > 0) {
          total += room.capacity * qty;
        }
      }
      return total;
    }, 0);

    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    // Calculate what the total would be if we add this quantity
    const newTotalGuests = currentSelectedGuests + (room.capacity * quantity);

    // Don't allow if it would exceed total guests needed
    if (quantity > 0 && newTotalGuests > totalGuests) {
      return; // Block the change
    }

    const newSelectedRooms = { ...selectedRooms };
    if (quantity > 0) {
      newSelectedRooms[roomId] = quantity;
    } else {
      delete newSelectedRooms[roomId];
    }
    setSelectedRooms(newSelectedRooms);

    // Show booking form if we have enough rooms for guests
    const selectedGuests = Object.entries(newSelectedRooms).reduce((total, [rId, qty]) => {
      const r = rooms.find(r => r.id === rId);
      if (r && qty > 0) {
        total += r.capacity * qty;
      }
      return total;
    }, 0);
    if (selectedGuests >= totalGuests && Object.keys(newSelectedRooms).length > 0) {
      setShowBookingForm(true);
      // Auto-scroll to booking form after a short delay to allow state update
      setTimeout(() => {
        document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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

  // Cash payment only available for today or tomorrow
  const isCashPaymentAvailable = () => {
    if (!checkInDate) return false;
    const checkIn = new Date(checkInDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Reset time to compare dates only
    checkIn.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    // Cash payment available for yesterday, today or tomorrow
    return checkIn.getTime() === today.getTime() ||
      checkIn.getTime() === tomorrow.getTime() ||
      checkIn.getTime() === yesterday.getTime();
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalPrice = calculateTotalPrice();
    const selectedGuests = calculateSelectedGuests();

    if (selectedGuests < totalGuests) {
      alert(`You need rooms for ${totalGuests} guests but only have capacity for ${selectedGuests}`);
      return;
    }

    // For cash payments, handle differently
    if (paymentMethod === 'cash') {
      const bookingData = {
        guestName,
        guestEmail,
        guestCount: selectedGuests,
        checkInDate,
        checkOutDate,
        accommodationId: Object.keys(selectedRooms)[0], // Use first selected room for simplicity
        totalPrice,
        paymentMethod: 'cash',
        status: 'confirmed' // Cash payments are immediately confirmed
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

        if (data.ok) {
          // Redirect to success page for cash payment
          window.location.href = `${data.success_url || '/booking-success.html'}?reference=${data.booking?.reference || ''}&type=accommodation&name=${encodeURIComponent(guestName)}&email=${encodeURIComponent(guestEmail)}&checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${selectedGuests}&amount=${totalPrice}&payment=cash`;
        } else {
          alert('Error creating booking: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Booking error:', error);
        alert('Error creating booking. Please try again.');
      }
      return;
    }

    // Card payment logic (existing)
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

  // New cart-first flow (consistent with tours)
  const handleAddRoomsToCart = () => {
    if (calculateSelectedGuests() < totalGuests || Object.keys(selectedRooms).length === 0) {
      return;
    }

    const nights = calculateNights();
    if (nights <= 0) {
      alert("Please select valid dates");
      return;
    }

    Object.entries(selectedRooms).forEach(([roomId, quantity]) => {
      const room = rooms.find(r => r.id === roomId);
      if (!room || quantity <= 0) return;

      const cartItem = {
        id: `room-${roomId}-${Date.now()}`,
        type: 'accommodation' as const,
        name: room.name,
        date: checkInDate,
        returnDate: checkOutDate,
        participants: quantity * (room.capacity || 2), // approximate guests covered by these rooms
        price: room.price,
        totalPrice: room.price * nights * quantity,
        details: {
          accommodationId: roomId,
          // Personal information will be collected on the cart page (single form)
        },
      };

      addToCart(cartItem);
    });

    // Redirect to cart immediately
    setLocation('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
      <Navigation />
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-400/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
           <div className="lg:col-span-12 mb-24 lg:mb-0">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-lg">
                Paraiso Ayahuasca
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto drop-shadow-md">
                Experimenta la auténtica hospitalidad amazónica en nuestro lodge ribereño
              </p>
            </div>

            {/* Date Selection */}
            <div className="mb-8 bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
              {checkInDate && checkOutDate ? (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      <span className="font-medium text-gray-900">{formatDateString(checkInDate)}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="font-medium text-gray-900">{formatDateString(checkOutDate)}</span>
                    </div>
                    <div className="flex items-center bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      <span className="font-medium text-gray-900">{totalGuests} huéspedes</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCheckInDate("");
                      setCheckOutDate("");
                    }}
                    className="text-primary hover:text-primary/90 hover:bg-primary/5 border-primary/20"
                  >
                    Cambiar Búsqueda
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleDateSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div
                    className="cursor-pointer"
                    onClick={() => (document.getElementById('checkin') as HTMLInputElement)?.showPicker()}
                  >
                    <Label htmlFor="checkin" className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block cursor-pointer">Fecha de Entrada</Label>
                    <Input
                      id="checkin"
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      min={(() => {
                        const d = new Date();
                        d.setDate(d.getDate() - 1);
                        return d.toISOString().split('T')[0];
                      })()}
                      className="bg-white border-gray-200 focus:border-primary focus:ring-primary h-11 cursor-pointer"
                      required
                    />
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() => (document.getElementById('checkout') as HTMLInputElement)?.showPicker()}
                  >
                    <Label htmlFor="checkout" className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block cursor-pointer">Fecha de Salida</Label>
                    <Input
                      id="checkout"
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                      className="bg-white border-gray-200 focus:border-primary focus:ring-primary h-11 cursor-pointer"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="guests" className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Huéspedes</Label>
                    <div className="flex items-center h-11 border border-gray-200 rounded-md bg-white px-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-primary"
                        onClick={() => setTotalGuests(Math.max(1, totalGuests - 1))}
                        disabled={totalGuests <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="flex-1 text-center font-medium text-gray-900">{totalGuests}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-primary"
                        onClick={() => setTotalGuests(Math.min(20, totalGuests + 1))}
                        disabled={totalGuests >= 20}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm transition-all">
                      Verificar Disponibilidad
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Rooms Section */}
            {checkInDate && checkOutDate && (
              <div id="rooms-section">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 drop-shadow-lg">Habitaciones Disponibles</h2>
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
                          <span className="text-sm text-gray-600">COP por noche</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <Users className="w-4 h-4 mr-1" />
                          Hasta {room.capacity} huéspedes
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Cantidad:</Label>
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
                  <CardTitle>Resumen de Selección</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Huéspedes Seleccionados</p>
                      <p className="text-2xl font-bold">{calculateSelectedGuests()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Noches</p>
                      <p className="text-2xl font-bold">{calculateNights()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Precio Total</p>
                      <p className="text-2xl font-bold text-primary">{formatPrice(calculateTotalPrice())}</p>
                    </div>
                  </div>

                  {calculateSelectedGuests() < totalGuests && (
                    <p className="text-red-600 text-sm">
                      ⚠️ Necesitas habitaciones para {totalGuests} huéspedes pero solo tienes capacidad para {calculateSelectedGuests()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Primary CTA - Add to Cart (replaces the removed sidebar) */}
            {checkInDate && checkOutDate && Object.keys(selectedRooms).length > 0 && (
              <div className="mb-12">
                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                  disabled={calculateSelectedGuests() < totalGuests}
                  onClick={handleAddRoomsToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart & Continue
                </Button>
                {calculateSelectedGuests() < totalGuests && (
                  <p className="text-xs text-orange-600 text-center mt-2 font-medium">
                    Selecciona más habitaciones para {totalGuests} personas
                  </p>
                )}
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Tu información personal y detalles extras se solicitarán una sola vez en el carrito.
                </p>
              </div>
            )}
          </div>
        )}




            {/* Booking Form removed - now using cart flow like tours.
                After selecting rooms, user clicks "Add to Cart & Continue" above,
                which adds to shared cart and redirects to /checkout (single form for personal info + payment). */}
            {/* The old personal info + payment method form has been replaced to avoid duplication. */}

            {/* Features Section */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wifi className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Conectividad</h3>
                <p className="text-gray-600">WiFi gratuito</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Desayuno Amazonico</h3>
                <p className="text-gray-600">Desayuno saludable amazónico</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Construccion Bioclimatica</h3>
                <p className="text-gray-600">Arquitectura integrada con la naturaleza para un mejor descanso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}