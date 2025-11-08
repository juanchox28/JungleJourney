import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, MapPin, Clock, Users, Calendar, ArrowRight, Minus, Plus, ShoppingCart } from "lucide-react";
import type { Tour } from "@shared/schema";
import { getApiUrl } from "@/lib/utils";
import { useCart } from "@/lib/cartContext";

export default function BoatTicketsPage() {
  const { addToCart } = useCart();
  const params = useParams();
  const categoryFilter = params.category || 'Traslados'; // Default to 'Traslados' if no category specified

  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [travelDate, setTravelDate] = useState("");

  // Fetch transfer routes from API
  const { data: transferRoutes = [] } = useQuery<Tour[]>({
    queryKey: ['/api/tours', categoryFilter],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/tours'));
      if (!response.ok) throw new Error('Failed to fetch tours');
      const tours = await response.json();
      // Filter by category (Traslados by default, but can be extended)
      return tours.filter((tour: Tour) => tour.category === categoryFilter);
    },
  });

  const selectedRouteData = transferRoutes.find(route => route.id === selectedRoute);
  const availableTimes = selectedRouteData?.description?.match(/\d{1,2}:\d{2}\s*(?:hs|AM|PM)/g) || [];

  const calculateTotal = () => {
    if (!selectedRouteData) return 0;
    const basePrice = parseInt(selectedRouteData.basePrice || "0");
    return basePrice * passengerCount;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!selectedRoute || !selectedTime || !travelDate) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    const totalPrice = calculateTotal();

    const cartItem = {
      id: `transfer-${selectedRoute}-${Date.now()}`,
      type: 'transfer' as const,
      name: selectedRouteData?.name || 'Traslado',
      date: travelDate,
      time: selectedTime,
      participants: passengerCount,
      price: selectedRouteData ? parseInt(selectedRouteData.basePrice || "0") : 0,
      totalPrice,
      details: {
        routeId: selectedRoute,
        passengerCount,
      },
    };

    addToCart(cartItem);
    alert("Traslado agregado al itinerario");
  };

  const handleBooking = async () => {
    if (!selectedRoute || !selectedTime || !travelDate) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    // Check booking advance time requirement
    if (selectedRouteData?.bookingAdvanceHours) {
      const selectedDateTime = new Date(`${travelDate}T${selectedTime}`);
      const now = new Date();
      const hoursDifference = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursDifference < selectedRouteData.bookingAdvanceHours) {
        alert(`Este traslado requiere reserva con ${selectedRouteData.bookingAdvanceHours} horas de anticipación. Por favor selecciona una fecha/hora posterior.`);
        return;
      }
    }

    const totalPrice = calculateTotal();

    // Create booking data
    const bookingData = {
      guestName: "Cliente", // For now, use a default name
      guestEmail: "cliente@example.com", // For now, use a default email
      guestCount: passengerCount,
      tourDate: travelDate,
      tourId: selectedRoute,
      totalPrice,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/create-tour-booking`, {
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
        alert('Error creando reserva: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error de reserva:', error);
      alert('Error creando reserva. Por favor intenta nuevamente.');
    }
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
            <span className="text-gray-900 font-medium">Traslados Fluviales</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {categoryFilter === 'Traslados' ? 'Traslados Fluviales' : 'Boat Tickets'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {categoryFilter === 'Traslados'
              ? 'Viaja entre destinos amazónicos con nuestro cómodo transporte fluvial'
              : 'Book your boat transportation services'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Routes Selection */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Rutas Disponibles</h2>
            <div className="space-y-4">
              {transferRoutes.map((route) => (
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
                          <div className="font-semibold text-lg">{route.name.split(' - ')[0] || route.name}</div>
                          <div className="text-sm text-gray-500">Salida</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="text-center">
                          <div className="font-semibold text-lg">{route.name.split(' - ')[1] || 'Destino'}</div>
                          <div className="text-sm text-gray-500">Llegada</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg font-bold">
                        {formatPrice(parseInt(route.basePrice || "0"))}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {route.duration || "2 horas"}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Múltiples salidas diarias
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{route.detalle || route.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {availableTimes.map((time) => (
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
                <CardTitle>Reserva Tu Viaje Fluvial</CardTitle>
                <CardDescription>
                  Selecciona tus detalles de viaje y completa tu reserva
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route Selection */}
                <div>
                  <Label htmlFor="route">Seleccionar Ruta</Label>
                  <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                    <SelectTrigger>
                      <SelectValue placeholder="Elige tu ruta" />
                    </SelectTrigger>
                    <SelectContent>
                      {transferRoutes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Travel Date */}
                <div>
                  <Label htmlFor="date">Fecha de Viaje</Label>
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
                    <Label htmlFor="time">Hora de Salida</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona hora de salida" />
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
                  <Label htmlFor="passengers">Número de Pasajeros</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                      disabled={passengerCount <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-semibold min-w-[2rem] text-center">{passengerCount}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPassengerCount(Math.min(20, passengerCount + 1))}
                      disabled={passengerCount >= 20}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Route Info */}
                {selectedRouteData && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Detalles del Viaje</h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Ruta:</span>
                        <span>{selectedRouteData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duración:</span>
                        <span>{selectedRouteData.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Precio por persona:</span>
                        <span>{formatPrice(parseInt(selectedRouteData.basePrice || "0"))}</span>
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
                    <div className="text-sm text-gray-600 mt-1">
                      {passengerCount} pasajero{passengerCount > 1 ? 's' : ''} × {formatPrice(parseInt(selectedRouteData?.basePrice || "0"))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddToCart}
                    variant="outline"
                    className="flex-1"
                    disabled={!selectedRoute || !travelDate || !selectedTime}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Agregar al Itinerario
                  </Button>
                  <Button
                    onClick={handleBooking}
                    className="flex-1"
                    disabled={!selectedRoute || !travelDate || !selectedTime}
                  >
                    Reservar Traslado Fluvial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}