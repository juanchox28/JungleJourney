import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/HeroSection";
import TourCard from "@/components/TourCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Tour } from "@shared/schema";
import { formatLocation, getPriceDisplay } from "@/lib/tourUtils";
import { getApiUrl } from "@/lib/utils";
import { Calendar, MapPin, Users, Star, Search } from "lucide-react";
import heroImage from '@assets/generated_images/Amazon_canopy_sunlight_hero_975fbf35.png';
import jaguarImage from '@assets/generated_images/Amazon_jaguar_wildlife_encounter_30857d91.png';
import dolphinImage from '@assets/generated_images/Pink_dolphins_Amazon_sunset_d0aee95e.png';
import canoeImage from '@assets/generated_images/Canoe_Amazon_river_dawn_94feb359.png';

const getImageForTour = (tour: Tour, index: number) => {
  const images = [jaguarImage, dolphinImage, canoeImage];
  return images[index % images.length];
};

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [selectedLocation, setSelectedLocation] = useState("");

  const { data: tours, isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/api/tours'));
      if (!response.ok) throw new Error('Failed to fetch tours');
      return response.json();
    },
  });

  const handleSearch = () => {
    if (selectedLocation) {
      console.log('Search:', { selectedLocation });
      setLocation(`/tours?location=${selectedLocation}`);
    }
  };

  const handleTourClick = (id: string) => {
    setLocation(`/tour/${id}`);
  };

  const featuredTours = tours?.slice(0, 6) || [];

  return (
    <div>
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
              <div className="max-w-4xl mx-auto mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hotel Booking Card */}
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">Reserva de Hotel</h3>
                      <p className="mb-4 text-white/90 text-sm font-medium">
                        Alojamientos unicos del Amazonas
                      </p>
                      <Link href="/hotel-booking">
                        <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 font-semibold shadow-lg border-2 border-white/30">
                          Reservar Hotel
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
  
                  {/* River Boat Tickets Card */}
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">Tiquetes de Barco</h3>
                      <p className="mb-4 text-white/90 text-sm font-medium">
                        Reserva transporte fluvial seguro y confiable
                      </p>
                      <Link href="/boat-tickets">
                        <Button size="lg" className="w-full bg-white text-primary hover:bg-white/90 font-semibold shadow-lg border-2 border-white/30">
                          Reservar Tiquetes
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
          </div>

          {/* Search Section */}
          <div className="max-w-3xl mx-auto backdrop-blur-md bg-white/10 rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white mb-2 font-medium">¿Dónde quieres comenzar tu experiencia amazónica?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 z-10" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/90 border border-white/30 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="">Seleccionar punto de partida</option>
                    <option value="leticia">Leticia - Puerta del Amazonas</option>
                    <option value="puerto-narino">Puerto Nariño - Cultura Indígena</option>
                    <option value="mocagua">Mocagua - Santuario de Vida Silvestre</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-1 flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full gap-2 bg-primary text-white hover:bg-primary/90 font-semibold shadow-lg border-2 border-white/30"
                  size="lg"
                >
                  <Search className="w-5 h-5" />
                  Explorar Tours
                </Button>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-2 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
                <span className="text-lg">⭐</span>
                <span className="font-medium">4.9 • Confiado por más de 1,000 Viajeros</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">Nuestros Destinos en Amazonas</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Alojamientos y tours en Leticia y Puerto Nariño, Colombia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <Card>
              <CardContent className="p-8">
                <h3 className="font-serif text-2xl font-semibold mb-3">Leticia</h3>
                <p className="text-muted-foreground mb-4">
                  The gateway to the Amazon, where Colombia, Brazil, and Peru meet. Experience vibrant wildlife and rich indigenous culture.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation('/tours')}
                  data-testid="button-leticia"
                >
                  Explore Leticia
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h3 className="font-serif text-2xl font-semibold mb-3">Puerto Nariño</h3>
                <p className="text-muted-foreground mb-4">
                  A peaceful riverside town known for sustainable tourism. Perfect for pink dolphin encounters and traditional river life.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation('/tours')}
                  data-testid="button-puerto-narino"
                >
                  Explore Puerto Nariño
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h3 className="font-serif text-2xl font-semibold mb-3">Mocagua</h3>
                <p className="text-muted-foreground mb-4">
                  An indigenous community offering authentic jungle experiences and wildlife rehabilitation projects.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation('/tours')}
                  data-testid="button-mocagua"
                >
                  Explore Mocagua
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">Tours Destacados</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Alojamientos y tours en Leticia y Puerto Nariño, Amazonas Colombia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div data-testid="loading-tours" className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Loading tours...</p>
              </div>
            ) : featuredTours.length > 0 ? (
              featuredTours.map((tour, index) => (
                <TourCard 
                  key={tour.id} 
                  id={tour.id}
                  image={getImageForTour(tour, index)}
                  title={tour.name}
                  description={tour.detalle || tour.description || ''}
                  duration={tour.duration || 'Various'}
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
              <div data-testid="no-tours" className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No tours available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold mb-4">¿Por Qué Elegir Paraíso Ayahuasca?</h2>
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
                <li><a href="/tours" className="hover:text-white transition-colors">Tours Guiados</a></li>
                <li><a href="/boat-tickets" className="hover:text-white transition-colors">Tiquetes de Barco</a></li>
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
    </div>
  );
}
