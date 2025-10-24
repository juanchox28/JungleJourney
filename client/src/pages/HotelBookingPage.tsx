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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
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

  const isCashPaymentAvailable = () => {
    if (!checkInDate) return false;
    const checkIn = new Date(checkInDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Reset time to compare dates only
    checkIn.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);

    return checkIn.getTime() === today.getTime() || checkIn.getTime() === tomorrow.getTime();
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* Reservation Details - Mobile: Bottom, Desktop: Right Sidebar */}
      <div className="fixed bottom-0 left-0 right-0 md:right-0 md:top-0 md:h-full md:w-80 bg-white/95 backdrop-blur-sm border-t md:border-t-0 md:border-l border-gray-200 shadow-xl z-50 md:overflow-y-auto">
        <div className="p-4 md:p-6 max-h-56 md:max-h-none overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Detalles de Reserva
          </h3>

          <div className="space-y-3 md:space-y-4">
            {/* Dates */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Fechas
              </div>
              <div className="text-sm">
                {checkInDate ? (
                  <div>
                    <div className="font-medium text-gray-900">Entrada: {new Date(checkInDate).toLocaleDateString('es-CO')}</div>
                    {checkOutDate && (
                      <div className="font-medium text-gray-900">Salida: {new Date(checkOutDate).toLocaleDateString('es-CO')}</div>
                    )}
                    {checkInDate && checkOutDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        {calculateNights()} noche{calculateNights() !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400">Selecciona fechas</div>
                )}
              </div>
            </div>

            {/* Guests */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Users className="w-4 h-4 mr-2" />
                Huéspedes
              </div>
              <div className="text-lg font-bold text-gray-900">
                {totalGuests} persona{totalGuests !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Selected Rooms */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Home className="w-4 h-4 mr-2" />
                Habitaciones
              </div>
              <div className="space-y-2">
                {Object.keys(selectedRooms).length === 0 ? (
                  <div className="text-gray-400 text-sm">Ninguna habitación</div>
                ) : (
                  Object.entries(selectedRooms).map(([roomId, quantity]) => {
                    const room = rooms.find(r => r.id === roomId);
                    return room ? (
                      <div key={roomId} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{room.name}</span>
                        <span className="font-medium text-gray-900">x{quantity}</span>
                      </div>
                    ) : null;
                  })
                )}
              </div>
              {Object.keys(selectedRooms).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Capacidad:</span>
                    <span className="font-bold text-gray-900">{calculateSelectedGuests()} huéspedes</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 md:p-4">
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <span className="text-lg mr-1">💰</span>
                Precio Total
              </div>
              <div className="space-y-1">
                {checkInDate && checkOutDate && Object.keys(selectedRooms).length > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Noches:</span>
                      <span>{calculateNights()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatPrice(calculateTotalPrice())}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-primary/30 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-primary">
                      {checkInDate && checkOutDate && Object.keys(selectedRooms).length > 0
                        ? formatPrice(calculateTotalPrice())
                        : '$0'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <span className="text-lg mr-1">📋</span>
                Estado
              </div>
              <div className="text-sm">
                {calculateSelectedGuests() >= totalGuests && Object.keys(selectedRooms).length > 0 ? (
                  <span className="text-green-600 font-medium">✅ Listo para reservar</span>
                ) : calculateSelectedGuests() < totalGuests && Object.keys(selectedRooms).length > 0 ? (
                  <span className="text-orange-600 font-medium">⚠️ Faltan habitaciones</span>
                ) : (
                  <span className="text-gray-400">Selecciona habitaciones</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pr-96 pb-72 md:pb-8">
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Selecciona Tus Fechas
            </CardTitle>
            <CardDescription>
              Elige tus fechas de entrada y salida para ver habitaciones disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDateSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="checkin">Fecha de Entrada</Label>
                <Input
                  id="checkin"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkout">Fecha de Salida</Label>
                <Input
                  id="checkout"
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="guests">Número de Huéspedes</Label>
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
                  Verificar Disponibilidad
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

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
                      <span className="text-sm text-gray-600">por noche</span>
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
          </div>
        )}

        {/* Booking Form */}
        {showBookingForm && (
          <Card>
            <CardHeader>
              <CardTitle>Completa Tu Reserva</CardTitle>
              <CardDescription>
                Por favor proporciona tus datos para completar la reservación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guest-name">Nombre Completo *</Label>
                    <Input
                      id="guest-name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Ingresa tu nombre completo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="guest-email">Dirección de Correo *</Label>
                    <Input
                      id="guest-email"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="Ingresa tu correo electrónico"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="special-requests">Solicitudes Especiales</Label>
                  <Textarea
                    id="special-requests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Cualquier requerimiento especial o notas..."
                    rows={3}
                  />
                </div>

                {/* Payment Method Selection */}
                {isCashPaymentAvailable() && (
                  <div>
                    <Label className="text-base font-medium">Método de Pago</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="card-payment"
                            name="payment-method"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                            className="mr-2"
                          />
                          <Label htmlFor="card-payment" className="cursor-pointer">
                            Tarjeta de Crédito/Débito
                          </Label>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Paga de forma segura en línea</p>
                      </div>
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}
                        onClick={() => setPaymentMethod('cash')}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="cash-payment"
                            name="payment-method"
                            checked={paymentMethod === 'cash'}
                            onChange={() => setPaymentMethod('cash')}
                            className="mr-2"
                          />
                          <Label htmlFor="cash-payment" className="cursor-pointer">
                            Efectivo en Recepción
                          </Label>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Paga cuando llegues</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold mb-4">
                    <span>Monto Total:</span>
                    <span className="text-primary">{formatPrice(calculateTotalPrice())}</span>
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    {paymentMethod === 'cash' ? 'Confirmar Reserva' : 'Proceder al Pago'}
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