import React from 'react';
import { useCart } from '@/lib/cartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, X, Calendar, Users, MapPin, Clock } from 'lucide-react';
import { Link } from 'wouter';

const FloatingItinerary: React.FC = () => {
  const { cart, removeFromCart, getTotalPrice, getTotalItems } = useCart();

  if (cart.length === 0) {
    return null;
  }

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

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-2xl border-2 border-primary/20 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Itinerario ({getTotalItems()})
            </div>
            <Badge variant="secondary" className="text-sm">
              {formatPrice(getTotalPrice())}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {cart.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(item.type)}</span>
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(item.type)}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-1 text-xs text-gray-600">
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

                <div className="flex justify-between items-center pt-1 border-t">
                  <span className="font-medium text-primary">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-3">
            <div className="flex justify-between items-center font-semibold text-lg mb-3">
              <span>Total:</span>
              <span className="text-primary">{formatPrice(getTotalPrice())}</span>
            </div>

            <Link href="/checkout">
              <Button className="w-full" size="sm">
                Proceder al Pago
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingItinerary;