import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, MapPin, Check, MessageCircle } from "lucide-react";
import type { Tour } from "@shared/schema";

interface TourDetailProps {
  tour: Tour;
  onInquire?: (tourId: string) => void;
}

export default function TourDetail({ tour, onInquire }: TourDetailProps) {
  const [bookingDate, setBookingDate] = useState("");
  const [participants, setParticipants] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [footSize, setFootSize] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");

  const handleBooking = async () => {
    if (!bookingDate || !guestName || !guestEmail) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    // Check booking advance time requirement
    if (tour.bookingAdvanceHours) {
      const selectedDateTime = new Date(bookingDate);
      const now = new Date();
      const hoursDifference = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursDifference < tour.bookingAdvanceHours) {
        alert(`Este tour requiere reserva con ${tour.bookingAdvanceHours} horas de anticipación. Por favor selecciona una fecha posterior.`);
        return;
      }
    }

    const totalPrice = parseInt(tour.basePrice || "0") * participants * 100; // Convert to cents for Wompi

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/create-tour-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestName,
          guestEmail,
          guestCount: participants,
          tourDate: bookingDate,
          tourId: tour.id,
          totalPrice,
          footSize,
          dietaryRestrictions,
          specialRequests,
        }),
      });

      const data = await response.json();

      if (data.ok && data.checkout_url) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
        <div className="lg:col-span-3">
          <div className="aspect-video rounded-2xl overflow-hidden mb-4">
            <img 
              src={tour.images[0]} 
              alt={tour.title}
              className="w-full h-full object-cover"
            />
          </div>
          {tour.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {tour.images.slice(1).map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                  <span className="font-semibold">{tour.rating}</span>
                  <span className="text-sm text-muted-foreground">({tour.reviews} reviews)</span>
                </div>
                <Badge>{tour.difficulty}</Badge>
              </div>

              <h1 className="font-serif text-3xl font-bold mb-4">{tour.title}</h1>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{tour.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{tour.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{tour.groupSize}</span>
                </div>
              </div>

              <div className="border-t border-border pt-6 mb-6">
                <div className="flex items-baseline gap-2 mb-6">
                  <span className={`${tour.priceDisplay.startsWith('$') ? 'text-4xl' : 'text-2xl'} font-bold`}>
                    {tour.priceDisplay}
                  </span>
                  {tour.priceDisplay.startsWith('$') && (
                    <span className="text-muted-foreground">per person</span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Contact us to customize your experience and check availability for your preferred dates.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="booking-date" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha del Tour
                      </label>
                      <input
                        id="booking-date"
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Participantes
                      </label>
                      <select
                        id="participants"
                        value={participants}
                        onChange={(e) => setParticipants(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {[1,2,3,4,5,6].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'persona' : 'personas'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      id="guest-name"
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Ingresa tu nombre completo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="guest-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      id="guest-email"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="foot-size" className="block text-sm font-medium text-gray-700 mb-1">
                        Talla de Calzado
                      </label>
                      <input
                        id="foot-size"
                        type="text"
                        value={footSize}
                        onChange={(e) => setFootSize(e.target.value)}
                        placeholder="Ej: 38, 42, 39 (separadas por coma)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="dietary-restrictions" className="block text-sm font-medium text-gray-700 mb-1">
                        Restricciones Alimentarias
                      </label>
                      <input
                        id="dietary-restrictions"
                        type="text"
                        value={dietaryRestrictions}
                        onChange={(e) => setDietaryRestrictions(e.target.value)}
                        placeholder="Vegetariano, alérgico a..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="special-requests" className="block text-sm font-medium text-gray-700 mb-1">
                      Solicitudes Especiales
                    </label>
                    <textarea
                      id="special-requests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Cualquier requerimiento especial..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <Button
                    data-testid="button-book-tour"
                    onClick={handleBooking}
                    className="w-full"
                    size="lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Reservar Tour
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">About This Tour</h2>
            <p className="text-muted-foreground leading-relaxed">{tour.description}</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">What's Included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tour.included.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-6">Itinerary</h2>
            <div className="space-y-4">
              {tour.itinerary.map((day) => (
                <Card key={day.day}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">Day {day.day}: {day.title}</h3>
                    <p className="text-muted-foreground">{day.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
