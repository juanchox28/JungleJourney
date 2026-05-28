import { useTranslation } from "react-i18next";
import { useEffect } from 'react';
import { useMemo } from 'react';

import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TourCard from "@/components/TourCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Calendar, Minus, Plus, MapPin, Leaf, Home as HomeIcon, Ship } from "lucide-react";
import heroImage from '@assets/generated_images/Amazon_canopy_sunlight_hero_975fbf35.png';
import jaguarImage from '@assets/generated_images/Amazon_jaguar_wildlife_encounter_30857d91.png';
import dolphinImage from '@assets/generated_images/Pink_dolphins_Amazon_sunset_d0aee95e.png';
import canoeImage from '@assets/generated_images/Canoe_Amazon_river_dawn_94feb359.png';
import type { Tour } from "@shared/schema";
import { formatLocation, getPriceDisplay, formatDuration } from "@/lib/tourUtils";

export default function HomePage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(2);

  const { data: tours } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
    queryFn: async () => {
      const response = await fetch('/api/tours');
      if (!response.ok) throw new Error('Failed to fetch tours');
      return response.json();
    },
  });

  const leticiaTours = useMemo(() => {
    return (tours ?? []).filter((tour) => {
      const loc = (tour.location || '').toLowerCase();
      return loc.includes('leticia');
    }).slice(0, 4);
  }, [tours]);

  const puertoNarinoTours = useMemo(() => {
    return (tours ?? []).filter((tour) => {
      const loc = (tour.location || '').toLowerCase();
      return loc.includes('puerto narino') || loc.includes('puerto-narino');
    }).slice(0, 4);
  }, [tours]);



  const getImageForTour = (tour: Tour, fallbackIndex = 0): string => {
    // If the tour has an images field in the JSON, use it
    if (tour.images && tour.images.trim() !== '') {
      const img = tour.images.trim();

      // If it's a JSON array string like '["img1.jpg", "img2.jpg"]'
      if (img.startsWith('[')) {
        try {
          const parsed = JSON.parse(img);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const first = String(parsed[0]);
            return first.startsWith('http') ? first : `/images/tours/${first}`;
          }
        } catch {
          // fall through to treat as plain string
        }
      }

      // Plain string or filename
      return img.startsWith('http') ? img : `/images/tours/${img}`;
    }

    // Fallback: cycle through the 3 default images
    const fallbackImages = [jaguarImage, dolphinImage, canoeImage];
    // Use tour id for stable rotation if possible
    const stableIndex = tour.id
      ? parseInt(tour.id.replace(/\D/g, '').slice(-1) || '0', 10)
      : fallbackIndex;
    return fallbackImages[stableIndex % fallbackImages.length];
  };

  const handleTourClick = (id: string) => {
    setLocation(`/tour/${id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate) {
      // Just redirect if no dates selected, let user select there
      setLocation("/reservar");
      return;
    }
    setLocation(`/reservar?checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`);
  };

  return (
    <main>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/90" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl text-shadow-lg">
              Paraíso Ayahuasca
            </h1>
            <p className="text-xl sm:text-2xl text-white max-w-3xl mx-auto drop-shadow-2xl mb-8 font-semibold">
              Hotels & Tours en Leticia y Puerto Nariño
            </p>

            {/* Quick Booking Section - Integrated into Hero */}
            {/* Quick Booking Section - Integrated into Hero */}
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-center text-primary flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Reserva tu Aventura
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div
                      className="cursor-pointer"
                      onClick={() => (document.getElementById('hero-checkin') as HTMLInputElement)?.showPicker()}
                    >
                      <Label htmlFor="hero-checkin" className="text-gray-700 font-medium mb-1.5 block cursor-pointer">Llegada</Label>
                      <Input
                        id="hero-checkin"
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        min={(() => {
                          const d = new Date();
                          d.setDate(d.getDate() - 1);
                          return d.toISOString().split('T')[0];
                        })()}
                        className="bg-white border-gray-300 focus:border-primary focus:ring-primary cursor-pointer"
                      />
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => (document.getElementById('hero-checkout') as HTMLInputElement)?.showPicker()}
                    >
                      <Label htmlFor="hero-checkout" className="text-gray-700 font-medium mb-1.5 block cursor-pointer">Salida</Label>
                      <Input
                        id="hero-checkout"
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        min={checkInDate || new Date().toISOString().split('T')[0]}
                        className="bg-white border-gray-300 focus:border-primary focus:ring-primary cursor-pointer"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-700 font-medium mb-1.5 block">Huéspedes</Label>
                      <div className="flex items-center h-10 border border-gray-300 rounded-md bg-white px-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-primary"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="flex-1 text-center font-medium text-gray-900">{guests}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-primary"
                          onClick={() => setGuests(Math.min(20, guests + 1))}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Buscar
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* Tours by Destination Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">Tours por Destino</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explora nuestras experiencias en Leticia, Puerto Nariño y Mocagua — los tres principales destinos del Amazonas colombiano
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {/* Leticia */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Ship className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Leticia</h3>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Entrada al Amazonas</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/tours?location=leticia')}
                >
                  Ver todos
                </Button>
              </div>

              <div className="space-y-4">
                {leticiaTours.length > 0 ? (
                  leticiaTours.map((tour, index) => (
                    <TourCard
                      key={tour.id}
                      id={tour.id}
                      image={getImageForTour(tour, index)}
                      title={tour.name}
                      description={tour.detalle || tour.description || ''}
                      duration={formatDuration(tour.duration)}
                      difficulty="Moderate"
                      priceDisplay={getPriceDisplay(tour).text}
                      location={formatLocation(tour.location)}
                      rating={4.7}
                      reviews={50}
                      groupSize="2-6"
                      onClick={handleTourClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">Cargando tours de Leticia...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Puerto Nariño */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <HomeIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Puerto Nariño</h3>
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Pueblo Amazónico</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/tours?location=puerto-narino')}
                >
                  Ver todos
                </Button>
              </div>

              <div className="space-y-4">
                {puertoNarinoTours.length > 0 ? (
                  puertoNarinoTours.map((tour, index) => (
                    <TourCard
                      key={tour.id}
                      id={tour.id}
                      image={getImageForTour(tour, index)}
                      title={tour.name}
                      description={tour.detalle || tour.description || ''}
                      duration={formatDuration(tour.duration)}
                      difficulty="Moderate"
                      priceDisplay={getPriceDisplay(tour).text}
                      location={formatLocation(tour.location)}
                      rating={4.7}
                      reviews={50}
                      groupSize="2-6"
                      onClick={handleTourClick}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">Cargando tours de Puerto Nariño...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mocagua */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl font-bold">Mocagua</h3>
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Vida Silvestre</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/tours?location=mocagua')}
                >
                  Ver todos
                </Button>
              </div>


            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => setLocation('/tours')}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-8"
            >
              Ver Todos los Tours
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">¿Por Qué Elegir Paraíso Ayahuasca?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Descubre por qué miles de viajeros eligen nuestras experiencias únicas en el Amazonas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🌿</span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Ecológico</h3>
                <p className="text-muted-foreground">
                  Priorizamos el turismo sostenible y apoyamos los esfuerzos de conservación local
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👨‍🏫</span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Guías Expertos</h3>
                <p className="text-muted-foreground">
                  Aprende de naturalistas certificados con décadas de experiencia en la selva
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏕️</span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">Cabañas Auténticas</h3>
                <p className="text-muted-foreground">
                  Hospedaje en cómodas eco-cabañas que se integran perfectamente con la naturaleza
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-serif text-2xl font-bold mb-4">Paraíso Ayahuasca</h3>
              <p className="text-gray-300 mb-4">
                Hotels & Tours en Leticia y Puerto Nariño, Amazonas Colombia
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>🏞️</span>
                <span>Puerto Nariño, Amazonas Colombia</span>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                <span>RNT 244213</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/hotel-booking" className="hover:text-white transition-colors">Reservas de Hotel</a></li>
                <li><a href="/accommodations" className="hover:text-white transition-colors">Alojamientos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Destinos</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Leticia - Puerta del Amazonas</li>
                <li>Puerto Nariño - Cultura Indígena</li>
                <li>Mocagua - Vida Silvestre</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Paraíso Ayahuasca Hotels & Tours. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
