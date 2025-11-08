import { useState } from "react";
import { useCart } from "@/lib/cartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Home, Calendar, Users, MapPin, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tour': return '🎯';
      case 'accommodation': return '🏠';
      case 'transfer': return '🚢';
      default: return '📅';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tour': return 'Tour';
      case 'accommodation': return 'Alojamiento';
      case 'transfer': return 'Traslado';
      default: return type;
    }
  };

  const handleCheckout = async () => {
    if (!guestName || !guestEmail) {
      alert("Por favor completa tu nombre y email");
      return;
    }

    if (cart.length === 0) {
      alert("No hay items en el carrito");
      return;
    }

    // Create checkout data
    const checkoutData = {
      guestName,
      guestEmail,
      specialRequests,
      items: cart,
      totalPrice: getTotalPrice(),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/create-cart-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      if (data.ok && data.checkout_url) {
        // Clear cart and redirect to payment
        clearCart();
        window.location.href = data.checkout_url;
      } else {
        alert('Error procesando el pago: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error de checkout:', error);
      alert('Error procesando el pago. Por favor intenta nuevamente.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-4">Carrito Vacío</h2>
            <p className="text-gray-600 mb-6">No tienes items en tu itinerario</p>
            <Link href="/">
              <Button>Explorar Servicios</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <span className="text-gray-900 font-medium">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuar Explorando
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Itinerario</CardTitle>
                <CardDescription>
                  Revisa los servicios que has seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(item.type)}</span>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(item.type)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.date).toLocaleDateString('es-CO')}</span>
                        {item.time && <span className="ml-1">• {item.time}</span>}
                      </div>

                      {item.returnDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Regreso: {new Date(item.returnDate).toLocaleDateString('es-CO')}</span>
                          {item.returnTime && <span className="ml-1">• {item.returnTime}</span>}
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{item.participants} persona{item.participants > 1 ? 's' : ''}</span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-medium text-primary">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>
                  Completa tus datos para procesar la reserva
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="border-t pt-4">
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                    size="lg"
                  >
                    Proceder al Pago Seguro
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Serás redirigido a una pasarela de pago segura
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}