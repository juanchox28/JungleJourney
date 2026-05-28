import { useState, useEffect } from "react";
import { useCart } from "@/lib/cartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Home, Calendar, Users, MapPin, Clock, ArrowLeft, ShoppingCart, Trash2, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Link } from "wouter";

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart, removeFromCart } = useCart();
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Per-item extra details for tours (collected here at the end before payment)
  const [itemExtras, setItemExtras] = useState<Record<string, { footSize?: string; dietaryRestrictions?: string }>>({});

  // Auto-fill guest info from the first cart item (if any previous data) + initialize extras
  useEffect(() => {
    if (cart.length > 0) {
      const first = cart[0];
      if (first.details?.guestName) setGuestName(first.details.guestName);
      if (first.details?.guestEmail) setGuestEmail(first.details.guestEmail);
      if (first.details?.specialRequests) setSpecialRequests(first.details.specialRequests);

      // Initialize extras for tour items
      const initialExtras: Record<string, any> = {};
      cart.forEach(item => {
        if (item.type === 'tour') {
          initialExtras[item.id] = {
            footSize: item.details?.footSize || '',
            dietaryRestrictions: item.details?.dietaryRestrictions || '',
          };
        }
      });
      setItemExtras(initialExtras);
    }
  }, [cart]);

  const updateItemExtra = (itemId: string, field: 'footSize' | 'dietaryRestrictions', value: string) => {
    setItemExtras(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

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

    // Enrich cart items with the final personal/extra info collected here (before payment)
    const enrichedItems = cart.map(item => {
      if (item.type === 'tour' && itemExtras[item.id]) {
        return {
          ...item,
          details: {
            ...item.details,
            footSize: itemExtras[item.id].footSize,
            dietaryRestrictions: itemExtras[item.id].dietaryRestrictions,
          },
        };
      }
      return item;
    });

    // Create checkout data — all personal information asked once at the end
    const checkoutData = {
      guestName,
      guestEmail,
      specialRequests,
      items: enrichedItems,
      totalPrice: getTotalPrice(),
    };

    try {
      const response = await fetch('/api/create-cart-checkout', {
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
      <Navigation />
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
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuar Explorando
            </Button>
          </Link>

          {/* Make "Add more" very noticeable so users add as many services as possible */}
          <div className="flex flex-wrap gap-2">
            <Link href="/tour-booking">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add more tours
              </Button>
            </Link>
            <Link href="/hotel-booking">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add more rooms
              </Button>
            </Link>
          </div>
        </div>

        {/* Small encouragement text */}
        <p className="text-xs text-muted-foreground -mt-3 mb-6">
          Tip: Add more experiences to your itinerary before paying — the more the merrier!
        </p>

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
                   <div key={item.id} className="border rounded-lg p-4 relative">
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

                       {/* Delete button for this cart item */}
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => removeFromCart(item.id)}
                         className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 -mt-1 -mr-1"
                         title="Remove from cart"
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
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

                      {/* Per-tour extra fields — asked once here before payment */}
                      {item.type === 'tour' && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          <div>
                            <Label className="text-xs">Foot / Shoe Size</Label>
                            <Input
                              value={itemExtras[item.id]?.footSize || ''}
                              onChange={(e) => updateItemExtra(item.id, 'footSize', e.target.value)}
                              placeholder="e.g. 38, 42"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Dietary Restrictions</Label>
                            <Input
                              value={itemExtras[item.id]?.dietaryRestrictions || ''}
                              onChange={(e) => updateItemExtra(item.id, 'dietaryRestrictions', e.target.value)}
                              placeholder="Vegetarian, allergies..."
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      )}
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

          {/* Checkout Form — pre-filled from booking, no re-typing needed */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Información Personal y Detalles Finales</CardTitle>
                <CardDescription>
                  Completa aquí tus datos y extras (solo una vez, antes de pagar).
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
                    disabled={cart.length === 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Pagar Ahora — {formatPrice(getTotalPrice())}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Tu info ya está pre-cargada. Serás redirigido a una pasarela de pago segura.
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