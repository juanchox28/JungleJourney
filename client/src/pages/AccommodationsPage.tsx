import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Accommodation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, Users, Wifi, Utensils } from "lucide-react";

export default function AccommodationsPage() {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const { data: accommodations = [], isLoading } = useQuery({
    queryKey: ["accommodations", selectedLocation, selectedType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedLocation) params.append("location", selectedLocation);
      if (selectedType) params.append("type", selectedType);

      const response = await fetch(`/api/accommodations?${params}`);
      if (!response.ok) throw new Error("Failed to fetch accommodations");
      return response.json() as Promise<Accommodation[]>;
    },
  });

  const locations = ["leticia", "puerto-narino", "mocagua"];
  const types = ["hotel", "lodge", "cabin"];

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(parseInt(price) || 0);
  };

  const parseAmenities = (amenitiesStr: string | null) => {
    if (!amenitiesStr) return [];
    try {
      return JSON.parse(amenitiesStr);
    } catch {
      return [];
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'restaurant':
      case 'bar': return <Utensils className="w-4 h-4" />;
      default: return null;
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
            <span className="text-gray-900 font-medium">Accommodations</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Amazon Accommodations
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover comfortable stays in the heart of the Amazon rainforest
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location.replace('-', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Accommodations Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading accommodations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accommodations.map((accommodation) => (
              <Card key={accommodation.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center">
                  <span className="text-gray-500">Image Placeholder</span>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{accommodation.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {accommodation.location?.replace('-', ' ').toUpperCase()}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {accommodation.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {accommodation.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Users className="w-4 h-4 mr-1" />
                    Up to {accommodation.maxGuests} guests
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {parseAmenities(accommodation.amenities).slice(0, 3).map((amenity: string) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {getAmenityIcon(amenity)}
                        <span className="ml-1">{amenity}</span>
                      </Badge>
                    ))}
                  </div>

                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(accommodation.pricePerNight || "0")} <span className="text-sm font-normal text-gray-600">per night</span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Link href={`/accommodation/${accommodation.id}`} className="w-full">
                    <Button className="w-full">
                      View Details & Book
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {accommodations.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No accommodations found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}