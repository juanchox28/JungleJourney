import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Tour, Accommodation, Booking } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Home, Plus, Edit, Trash2, Eye, Users, MapPin, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";

export default function AdminPage() {
    const { t } = useTranslation();
    const [isAuthenticated, setIsAuthenticated] = useState(true); // No authentication required
    const [activeTab, setActiveTab] = useState("overview");

    console.log("🔍 AdminPage render - isAuthenticated:", isAuthenticated);
   const [editingTour, setEditingTour] = useState<Tour | null>(null);
   const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null);
   const [isTourDialogOpen, setIsTourDialogOpen] = useState(false);
   const [isAccommodationDialogOpen, setIsAccommodationDialogOpen] = useState(false);
   const [deletingTourId, setDeletingTourId] = useState<string | null>(null);
   const [deletingAccommodationId, setDeletingAccommodationId] = useState<string | null>(null);
   const [priceChanges, setPriceChanges] = useState<Record<string, Partial<Tour>>>({});

   // Update accommodation mutation (missing from current code)
   const updateAccommodationMutation = useMutation({
     mutationFn: async ({ id, accommodationData }: { id: string; accommodationData: any }) => {
       const response = await fetch(`/api/naane/accommodations/${id}`, {
         method: "PUT",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify(accommodationData),
       });
       if (!response.ok) throw new Error("Failed to update accommodation");
       return response.json();
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["accommodations"] });
       setIsAccommodationDialogOpen(false);
       setEditingAccommodation(null);
       toast({ title: "Success", description: "Accommodation updated successfully" });
     },
   });

   const deleteAccommodationMutation = useMutation({
     mutationFn: async (id: string) => {
       const response = await fetch(`/api/naane/accommodations/${id}`, {
         method: "DELETE",
       });
       if (!response.ok) throw new Error("Failed to delete accommodation");
       return response.json();
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["accommodations"] });
       setDeletingAccommodationId(null);
       toast({ title: "Success", description: "Accommodation deleted successfully" });
     },
   });

   const { toast } = useToast();
   const queryClient = useQueryClient();

   // Authentication - bypassed
    const handleLogin = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      console.log("🔓 Admin login bypassed - no authentication required");
      setIsAuthenticated(true);
    };

  // Data fetching
   const { data: tours = [] } = useQuery({
     queryKey: ["admin-tours"],
     queryFn: async () => {
       console.log("🔍 Fetching admin tours...");
       const response = await fetch("/api/naane/tours");
       if (!response.ok) throw new Error("Failed to fetch tours");
       const data = await response.json();
       console.log("✅ Admin tours fetched:", data.length, "items");
       return data as Promise<Tour[]>;
     },
     enabled: isAuthenticated,
   });

   const { data: accommodations = [] } = useQuery({
     queryKey: ["admin-accommodations"],
     queryFn: async () => {
       console.log("🔍 Fetching admin accommodations...");
       const response = await fetch("/api/naane/accommodations");
       if (!response.ok) throw new Error("Failed to fetch accommodations");
       const data = await response.json();
       console.log("✅ Admin accommodations fetched:", data.length, "items");
       return data as Promise<Accommodation[]>;
     },
     enabled: isAuthenticated,
   });

  const { data: bookings = [] } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const response = await fetch("/api/naane/bookings");
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json() as Promise<Booking[]>;
    },
    enabled: isAuthenticated,
  });

  // Mutations
  const createTourMutation = useMutation({
    mutationFn: async (tourData: any) => {
      const response = await fetch("/api/naane/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tourData),
      });
      if (!response.ok) throw new Error("Failed to create tour");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      setIsTourDialogOpen(false);
      setEditingTour(null);
      toast({ title: "Success", description: "Tour created successfully" });
    },
  });

  const updateTourMutation = useMutation({
    mutationFn: async ({ id, tourData }: { id: string; tourData: any }) => {
      const response = await fetch(`/api/naane/tours/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tourData),
      });
      if (!response.ok) throw new Error("Failed to update tour");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      setIsTourDialogOpen(false);
      setEditingTour(null);
      toast({ title: "Success", description: "Tour updated successfully" });
    },
  });

  const deleteTourMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/naane/tours/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete tour");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      setDeletingTourId(null);
      toast({ title: "Success", description: "Tour deleted successfully" });
    },
  });

  const createAccommodationMutation = useMutation({
    mutationFn: async (accommodationData: any) => {
      const response = await fetch("/api/naane/accommodations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accommodationData),
      });
      if (!response.ok) throw new Error("Failed to create accommodation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accommodations"] });
      setIsAccommodationDialogOpen(false);
      setEditingAccommodation(null);
      toast({ title: "Success", description: "Accommodation created successfully" });
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/naane/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update booking");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: "Success", description: "Booking status updated" });
    },
  });

  const formatPrice = (price: string) => {
    const numericPrice = parseInt(price) || 0;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(numericPrice);
  };

  const formatPricePerPerson = (price: string, pax: number) => {
    const numericPrice = parseInt(price) || 0;
    const pricePerPerson = Math.round(numericPrice / pax);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(pricePerPerson);
  };

  // Price management functions
  const updateTourPrice = (tourId: string, field: keyof Tour, value: string | null) => {
    setPriceChanges(prev => ({
      ...prev,
      [tourId]: {
        ...prev[tourId],
        [field]: value
      }
    }));
  };

  const saveTourPrices = async (tourId: string) => {
    if (!priceChanges[tourId]) return;

    try {
      console.log("💾 Saving prices for tour:", tourId, JSON.stringify(priceChanges[tourId], null, 2));
      await updateTourMutation.mutateAsync({
        id: tourId,
        tourData: priceChanges[tourId]
      });

      // Clear the changes after successful save
      setPriceChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[tourId];
        return newChanges;
      });

      toast({ title: "Success", description: "Precios actualizados correctamente" });
    } catch (error) {
      console.error("❌ Error saving prices:", error);
      toast({ title: "Error", description: "Error al actualizar precios", variant: "destructive" });
    }
  };

  const hasUnsavedChanges = (tourId: string) => {
    const changes = priceChanges[tourId];
    if (!changes) return false;

    // Check if any field has been modified (including set to null)
    return Object.keys(changes).some(key => {
      const currentValue = changes[key as keyof Tour];
      const originalValue = tours.find(t => t.id === tourId)?.[key as keyof Tour];
      return currentValue !== originalValue;
    });
  };

  // No authentication required - directly show admin interface

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="flex items-center hover:text-primary transition-colors">
                <Home className="w-4 h-4 mr-1" />
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Panel de Administración</span>
            </div>
            {/* No authentication - no logout needed */}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🏞️ Jungle Journey</h1>
          <p className="text-xl text-muted-foreground">
            Panel de Administración - Tours, Alojamientos y Reservas
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tours Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{tours.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Home className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Alojamientos</p>
                  <p className="text-2xl font-bold text-gray-900">{accommodations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reservas</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categorías</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(tours.map(t => t.category).filter(Boolean)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              📊 Resumen
            </TabsTrigger>
            <TabsTrigger value="tours" className="flex items-center gap-2">
              🏞️ Tours ({tours.length})
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              💰 Precios
            </TabsTrigger>
            <TabsTrigger value="accommodations" className="flex items-center gap-2">
              🏠 Alojamientos ({accommodations.length})
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              📅 Reservas ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              📝 Contenido
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              📈 Analíticas
            </TabsTrigger>
          </TabsList>

          {/* Tours Tab */}
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>📈 Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sistema inicializado</p>
                        <p className="text-xs text-gray-500">✅ {tours.length} tours cargados</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Alojamientos activos</p>
                        <p className="text-xs text-gray-500">🏠 {accommodations.length} alojamientos disponibles</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Reservas procesadas</p>
                        <p className="text-xs text-gray-500">📅 {bookings.length} reservas totales</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
  
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>⚡ Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setActiveTab("tours")}
                    >
                      ➕ Crear Nuevo Tour
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setActiveTab("pricing")}
                    >
                      💰 Gestionar Precios
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setActiveTab("accommodations")}
                    >
                      🏠 Agregar Alojamiento
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setActiveTab("bookings")}
                    >
                      📋 Ver Reservas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
  
            {/* Recent Tours */}
            <Card>
              <CardHeader>
                <CardTitle>🏞️ Tours Recientes</CardTitle>
                <CardDescription>Últimos tours agregados o modificados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tours.slice(0, 5).map((tour) => (
                    <div key={tour.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          🏞️
                        </div>
                        <div>
                          <p className="font-medium">{tour.name}</p>
                          <p className="text-sm text-gray-500">{tour.category} • {tour.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{tour.category}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTour(tour);
                            setIsTourDialogOpen(true);
                            setActiveTab("tours");
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
  
          <TabsContent value="tours" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestión de Tours</h2>
              <Dialog open={isTourDialogOpen} onOpenChange={setIsTourDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingTour(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Tour
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingTour ? 'Editar Tour' : 'Agregar Nuevo Tour'}</DialogTitle>
                    <DialogDescription>
                      Complete los detalles del tour a continuación
                    </DialogDescription>
                  </DialogHeader>
                  <TourForm
                    tour={editingTour}
                    onSubmit={(data) => {
                      if (editingTour) {
                        updateTourMutation.mutate({ id: editingTour.id, tourData: data });
                      } else {
                        createTourMutation.mutate(data);
                      }
                    }}
                    isLoading={editingTour ? updateTourMutation.isPending : createTourMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Tours by Category */}
            {['Dia Completo', 'Medio Dia', 'Nocturno', 'Con Alojamiento', 'Circuito / Tour', 'Medicinas ancestrales', 'Artesanías'].map((category) => {
              const categoryTours = tours.filter(t => t.category === category);
              if (categoryTours.length === 0) return null;

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-lg">🏞️</span>
                      {category} ({categoryTours.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Servicio</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead className="text-center">Precio por Persona (1 pax)</TableHead>
                          <TableHead className="text-center">Precio por Persona (2 pax)</TableHead>
                          <TableHead className="text-center">Precio por Persona (3 pax)</TableHead>
                          <TableHead className="text-center">Precio por Persona (4 pax)</TableHead>
                          <TableHead className="text-center">Precio por Persona (5 pax)</TableHead>
                          <TableHead className="text-center">Precio Base</TableHead>
                          <TableHead className="w-24">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryTours.map((tourItem) => (
                          <TableRow key={tourItem.id}>
                            <TableCell className="font-medium">{tourItem.name}</TableCell>
                            <TableCell>{tourItem.location}</TableCell>
                            <TableCell>
                              <div className="space-y-1 text-sm">
                                {tourItem.price2 && (
                                  <div>1 pax: {formatPricePerPerson(tourItem.price2, 1)}</div>
                                )}
                                {tourItem.price3 && (
                                  <div>2 pax: {formatPricePerPerson(tourItem.price3, 2)}</div>
                                )}
                                {tourItem.price4 && (
                                  <div>3 pax: {formatPricePerPerson(tourItem.price4, 3)}</div>
                                )}
                                {tourItem.price5 && (
                                  <div>4 pax: {formatPricePerPerson(tourItem.price5, 4)}</div>
                                )}
                                {tourItem.price6 && (
                                  <div>5 pax: {formatPricePerPerson(tourItem.price6, 5)}</div>
                                )}
                                {!tourItem.price2 && !tourItem.price3 && !tourItem.price4 && !tourItem.price5 && !tourItem.price6 && (
                                  <div>Precio base: {formatPrice(tourItem.basePrice || "0")}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingTour(tourItem);
                                    setIsTourDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => {
                                    if (confirm(`¿Está seguro de que desea eliminar "${tourItem.name}"?`)) {
                                      deleteTourMutation.mutate(tourItem.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestión de Precios</h2>
              <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["tours"] })}>
                🔄 Actualizar
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>💰 Tabla de Precios - Todos los Servicios</CardTitle>
                <CardDescription>
                  Gestiona los precios por persona para cada servicio. Los precios se almacenan como "por persona" y se muestran automáticamente en la interfaz pública.
                  Al momento de pagar, se calcula el precio total multiplicando por el número de personas.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-64">Servicio</TableHead>
                      <TableHead className="w-32">Categoría</TableHead>
                      <TableHead className="text-center">1 Persona</TableHead>
                      <TableHead className="text-center">2 Personas</TableHead>
                      <TableHead className="text-center">3 Personas</TableHead>
                      <TableHead className="text-center">4 Personas</TableHead>
                      <TableHead className="text-center">5 Personas</TableHead>
                      <TableHead className="text-center">Precio Base</TableHead>
                      <TableHead className="w-24">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.map((tourItem) => (
                      <TableRow key={tourItem.id}>
                        <TableCell className="font-medium">{tourItem.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {tourItem.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={priceChanges[tourItem.id]?.price2 ?? tourItem.price2 ?? '0'}
                            onChange={(e) => updateTourPrice(tourItem.id, 'price2', e.target.value === '' ? '0' : e.target.value)}
                            className="w-24 h-8 text-center"
                            placeholder="0"
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={priceChanges[tourItem.id]?.price3 ?? tourItem.price3 ?? ''}
                            onChange={(e) => updateTourPrice(tourItem.id, 'price3', e.target.value === '' ? null : e.target.value)}
                            className="w-24 h-8 text-center"
                            placeholder="Precio por persona"
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={priceChanges[tourItem.id]?.price4 ?? tourItem.price4 ?? ''}
                            onChange={(e) => updateTourPrice(tourItem.id, 'price4', e.target.value === '' ? null : e.target.value)}
                            className="w-24 h-8 text-center"
                            placeholder="Precio por persona"
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={priceChanges[tourItem.id]?.price5 ?? tourItem.price5 ?? ''}
                            onChange={(e) => updateTourPrice(tourItem.id, 'price5', e.target.value === '' ? null : e.target.value)}
                            className="w-24 h-8 text-center"
                            placeholder="Precio por persona"
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={priceChanges[tourItem.id]?.price6 ?? tourItem.price6 ?? ''}
                            onChange={(e) => updateTourPrice(tourItem.id, 'price6', e.target.value === '' ? null : e.target.value)}
                            className="w-24 h-8 text-center"
                            placeholder="Precio por persona"
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={priceChanges[tourItem.id]?.basePrice ?? tourItem.basePrice ?? (priceChanges[tourItem.id]?.price2 || tourItem.price2 || '0')}
                            onChange={(e) => updateTourPrice(tourItem.id, 'basePrice', e.target.value)}
                            className="w-24 h-8 text-center bg-gray-50"
                            placeholder={priceChanges[tourItem.id]?.price2 || tourItem.price2 || '0'}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => saveTourPrices(tourItem.id)}
                            disabled={!hasUnsavedChanges(tourItem.id)}
                            className="w-full"
                          >
                            💾 Guardar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Price Preview */}
            <Card>
              <CardHeader>
                <CardTitle>👁️ Vista Previa - Cómo se ven los precios</CardTitle>
                <CardDescription>
                  Los precios se muestran como "por persona" en la interfaz pública. Al momento de pagar, se calcula el precio total multiplicando por el número de personas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tours.slice(0, 4).map((tour) => (
                    <div key={tour.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{tour.name}</h4>
                      <div className="space-y-1 text-sm">
                        {tour.price2 && <div>1 persona: {formatPrice(tour.price2)} por persona</div>}
                        {tour.price3 && <div>2 personas: {formatPrice(tour.price3)} por persona</div>}
                        {tour.price4 && <div>3 personas: {formatPrice(tour.price4)} por persona</div>}
                        {tour.price5 && <div>4 personas: {formatPrice(tour.price5)} por persona</div>}
                        {tour.price6 && <div>5 personas: {formatPrice(tour.price6)} por persona</div>}
                        {!tour.price2 && !tour.price3 && !tour.price4 && !tour.price5 && !tour.price6 && (
                          <div>Precio base: {formatPrice(tour.basePrice || "0")}</div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                        💡 Al pagar, el precio total será: precio × número de personas
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestión de Traslados</h2>
              <Dialog open={isTourDialogOpen} onOpenChange={setIsTourDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingTour(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Traslado
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingTour ? 'Editar Traslado' : 'Agregar Nuevo Traslado'}</DialogTitle>
                    <DialogDescription>
                      Complete los detalles del traslado a continuación
                    </DialogDescription>
                  </DialogHeader>
                  <TourForm
                    tour={editingTour}
                    onSubmit={(data) => {
                      if (editingTour) {
                        updateTourMutation.mutate({ id: editingTour.id, tourData: data });
                      } else {
                        createTourMutation.mutate(data);
                      }
                    }}
                    isLoading={editingTour ? updateTourMutation.isPending : createTourMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Ruta</TableHead>
                      <TableHead>Precios por Persona</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.filter(t => t.category === 'Traslados').map((tourItem) => (
                      <TableRow key={tourItem.id}>
                        <TableCell className="font-medium">{tourItem.name}</TableCell>
                        <TableCell>{tourItem.location}</TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {tourItem.price2 && (
                              <div>1 pax: {formatPricePerPerson(tourItem.price2, 1)}</div>
                            )}
                            {tourItem.price3 && (
                              <div>2 pax: {formatPricePerPerson(tourItem.price3, 2)}</div>
                            )}
                            {tourItem.price4 && (
                              <div>3 pax: {formatPricePerPerson(tourItem.price4, 3)}</div>
                            )}
                            {tourItem.price5 && (
                              <div>4 pax: {formatPricePerPerson(tourItem.price5, 4)}</div>
                            )}
                            {tourItem.price6 && (
                              <div>5 pax: {formatPricePerPerson(tourItem.price6, 5)}</div>
                            )}
                            {!tourItem.price2 && !tourItem.price3 && !tourItem.price4 && !tourItem.price5 && !tourItem.price6 && (
                              <div>Precio base: {formatPrice(tourItem.basePrice || "0")}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingTour(tourItem);
                                setIsTourDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingTour(tourItem);
                                setIsTourDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => {
                                if (confirm(`¿Está seguro de que desea eliminar "${tourItem.name}"?`)) {
                                  deleteTourMutation.mutate(tourItem.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accommodations Tab */}
          <TabsContent value="accommodations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestión de Alojamientos</h2>
              <Dialog open={isAccommodationDialogOpen} onOpenChange={setIsAccommodationDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingAccommodation(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Alojamiento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingAccommodation ? 'Editar Alojamiento' : 'Agregar Nuevo Alojamiento'}</DialogTitle>
                    <DialogDescription>
                      Complete los detalles del alojamiento a continuación
                    </DialogDescription>
                  </DialogHeader>
                  <AccommodationForm
                    accommodation={editingAccommodation}
                    onSubmit={(data) => {
                      if (editingAccommodation) {
                        updateAccommodationMutation.mutate({ id: editingAccommodation.id, accommodationData: data });
                      } else {
                        createAccommodationMutation.mutate(data);
                      }
                    }}
                    isLoading={editingAccommodation ? updateAccommodationMutation.isPending : createAccommodationMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Accommodations by Type */}
            {['Alojamientos increibles', 'Alojamiento'].map((type) => {
              const typeAccommodations = accommodations.filter(a => a.type === type);
              if (typeAccommodations.length === 0) return null;

              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-lg">🏨</span>
                      {type} ({typeAccommodations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Ubicación</TableHead>
                          <TableHead>Precio/Noche</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {typeAccommodations.map((accommodation) => (
                          <TableRow key={accommodation.id}>
                            <TableCell className="font-medium">{accommodation.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {accommodation.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{accommodation.location}</TableCell>
                            <TableCell>{formatPrice(accommodation.pricePerNight || "0")}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingAccommodation(accommodation);
                                    setIsAccommodationDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => {
                                    if (confirm(`¿Está seguro de que desea eliminar "${accommodation.name}"?`)) {
                                      deleteAccommodationMutation.mutate(accommodation.id);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold">Bookings Management</h2>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.guestName}</div>
                            <div className="text-sm text-muted-foreground">{booking.guestEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.tourId ? (
                            <Badge variant="outline">Tour</Badge>
                          ) : (
                            <Badge variant="outline">Accommodation</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {booking.checkInDate && booking.checkOutDate ? (
                            <div className="text-sm">
                              {booking.checkInDate} to {booking.checkOutDate}
                            </div>
                          ) : booking.tourDate ? (
                            <div className="text-sm">{booking.tourDate}</div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPrice(booking.totalPrice || "0")}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateBookingStatusMutation.mutate({
                                    id: booking.id,
                                    status: 'confirmed'
                                  })}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => updateBookingStatusMutation.mutate({
                                    id: booking.id,
                                    status: 'cancelled'
                                  })}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <h2 className="text-2xl font-bold">Content Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Site Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Site Settings</CardTitle>
                  <CardDescription>Manage global site configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="site-title">Site Title</Label>
                    <Input id="site-title" defaultValue="Paraíso Ayahuasca Hotels & Tours" />
                  </div>
                  <div>
                    <Label htmlFor="site-description">Site Description</Label>
                    <Textarea id="site-description" rows={3} defaultValue="Paraíso Ayahuasca Hotels & Tours - Alojamientos y tours en Leticia y Puerto Nariño, Amazonas Colombia. Experiencias auténticas con ceremonias tradicionales." />
                  </div>
                  <div>
                    <Label htmlFor="business-id">Business ID (RNT)</Label>
                    <Input id="business-id" defaultValue="244213" />
                  </div>
                  <Button>Save Settings</Button>
                </CardContent>
              </Card>

              {/* Hero Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Hero Images</CardTitle>
                  <CardDescription>Manage homepage hero images</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Current Hero Image</Label>
                    <div className="mt-2">
                      <img
                        src="/assets/generated_images/Amazon_canopy_sunlight_hero_975fbf35.png"
                        alt="Current hero"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="hero-upload">Upload New Hero Image</Label>
                    <Input id="hero-upload" type="file" accept="image/*" />
                  </div>
                  <Button>Update Hero Image</Button>
                </CardContent>
              </Card>
            </div>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Manage search engine optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meta-title">Meta Title</Label>
                    <Input id="meta-title" defaultValue="Paraíso Ayahuasca Hotels & Tours - Leticia y Puerto Nariño, Amazonas Colombia" />
                  </div>
                  <div>
                    <Label htmlFor="meta-description">Meta Description</Label>
                    <Input id="meta-description" defaultValue="Paraíso Ayahuasca Hotels & Tours - Alojamientos y tours en Leticia y Puerto Nariño, Amazonas Colombia. Experiencias auténticas con ceremonias tradicionales. RNT 244213" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input id="keywords" defaultValue="Paraíso Ayahuasca, hotels, tours, Leticia, Puerto Nariño, Amazonas, Colombia, ceremonias ayahuasca, turismo indigena, alojamiento amazonas, RNT 244213" />
                </div>
                <Button>Save SEO Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Reports</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Booking Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{bookings.length}</div>
                  <p className="text-sm text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Confirmed Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </div>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatPrice(bookings.reduce((sum, b) => sum + parseInt(b.totalPrice || '0'), 0).toString())}
                  </div>
                  <p className="text-sm text-muted-foreground">Total revenue</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest bookings and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.tourId ? 'Tour booking' : 'Accommodation booking'} • {booking.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(booking.totalPrice || '0')}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Form Components
function TourForm({ tour, onSubmit, isLoading }: {
  tour?: Tour | null;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: tour?.name || "",
    category: tour?.category || "",
    description: tour?.description || "",
    detalle: tour?.detalle || "",
    duration: tour?.duration || "",
    location: tour?.location || "",
    basePrice: tour?.basePrice || "",
    price2: tour?.price2 || "",
    price3: tour?.price3 || "",
    price4: tour?.price4 || "",
    price5: tour?.price5 || "",
    price6: tour?.price6 || "",
    bookingAdvanceHours: tour?.bookingAdvanceHours || 24,
    images: (() => {
      if (!tour?.images) return [];
      try {
        // Try to parse as JSON first
        return JSON.parse(tour.images);
      } catch {
        // If it's not JSON, treat as comma-separated string or single URL
        if (tour.images.includes(',')) {
          return tour.images.split(',').map(url => url.trim());
        } else if (tour.images.trim()) {
          return [tour.images.trim()];
        }
        return [];
      }
    })(),
  });

  const [imageUrls, setImageUrls] = useState<string[]>(
    (() => {
      if (!tour?.images) return [];
      try {
        // Try to parse as JSON first
        return JSON.parse(tour.images);
      } catch {
        // If it's not JSON, treat as comma-separated string or single URL
        if (tour.images.includes(',')) {
          return tour.images.split(',').map(url => url.trim());
        } else if (tour.images.trim()) {
          return [tour.images.trim()];
        }
        return [];
      }
    })()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price2: formData.price2 || null,
      price3: formData.price3 || null,
      price4: formData.price4 || null,
      price5: formData.price5 || null,
      price6: formData.price6 || null,
      images: JSON.stringify(imageUrls),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre del Tour</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Categoría</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Seleccionar Categoría</option>
            <option value="Traslados">Traslados</option>
            <option value="Dia Completo">Día Completo</option>
            <option value="Medio Dia">Medio Día</option>
            <option value="Nocturno">Nocturno</option>
            <option value="Con Alojamiento">Con Alojamiento</option>
            <option value="Circuito / Tour">Circuito / Tour</option>
            <option value="Medicinas ancestrales">Medicinas Ancestrales</option>
            <option value="Artesanías">Artesanías</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción (incluye horarios de salida)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Ejemplo: Transporte fluvial desde Puerto Nariño a Leticia: 7:00 hs, 10:00 hs, 13:30 hs, 15:30 hs"
        />
      </div>

      <div>
        <Label htmlFor="bookingAdvanceHours">Horas de Anticipación Requeridas</Label>
        <Input
          id="bookingAdvanceHours"
          type="number"
          value={formData.bookingAdvanceHours || 24}
          onChange={(e) => setFormData({ ...formData, bookingAdvanceHours: parseInt(e.target.value) || 24 })}
          min="1"
          max="168"
          placeholder="24"
        />
        <p className="text-sm text-gray-600 mt-1">
          Horas mínimas requeridas antes de la salida para poder reservar
        </p>
      </div>

      <div>
        <Label htmlFor="detalle">Details</Label>
        <Textarea
          id="detalle"
          value={formData.detalle}
          onChange={(e) => setFormData({ ...formData, detalle: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="duration">Duración</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="ej. 3 horas, 2 días"
          />
        </div>
        <div>
          <Label htmlFor="location">Ubicación</Label>
          <select
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Seleccionar Ubicación</option>
            <option value="leticia">Leticia</option>
            <option value="puerto-narino">Puerto Nariño</option>
            <option value="mocagua">Mocagua</option>
          </select>
        </div>
        <div>
          <Label htmlFor="basePrice">Precio Base (COP)</Label>
          <Input
            id="basePrice"
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
            placeholder="Precio total para grupo"
          />
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-lg font-semibold text-blue-800 mb-2">💰 Gestión de Precios</h4>
          <p className="text-sm text-blue-700">
            Los precios se gestionan desde la pestaña <strong>"💰 Precios"</strong> en el panel de administración.
            Esta sección es solo para información básica del tour.
          </p>
        </div>
      </div>

      <div>
        <Label>Images</Label>
        <ImageUpload
          images={imageUrls}
          onImagesChange={setImageUrls}
          maxImages={10}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : (tour ? "Update Tour" : "Create Tour")}
        </Button>
      </DialogFooter>
    </form>
  );
}

function AccommodationForm({ accommodation, onSubmit, isLoading }: {
  accommodation?: Accommodation | null;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: accommodation?.name || "",
    type: accommodation?.type || "hotel",
    description: accommodation?.description || "",
    location: accommodation?.location || "",
    pricePerNight: accommodation?.pricePerNight || "",
    amenities: accommodation?.amenities || "",
    maxGuests: accommodation?.maxGuests || 2,
    images: (() => {
      if (!accommodation?.images) return [];
      try {
        // Try to parse as JSON first
        return JSON.parse(accommodation.images);
      } catch {
        // If it's not JSON, treat as comma-separated string or single URL
        if (accommodation.images.includes(',')) {
          return accommodation.images.split(',').map(url => url.trim());
        } else if (accommodation.images.trim()) {
          return [accommodation.images.trim()];
        }
        return [];
      }
    })(),
  });

  const [imageUrls, setImageUrls] = useState<string[]>(
    (() => {
      if (!accommodation?.images) return [];
      try {
        // Try to parse as JSON first
        return JSON.parse(accommodation.images);
      } catch {
        // If it's not JSON, treat as comma-separated string or single URL
        if (accommodation.images.includes(',')) {
          return accommodation.images.split(',').map(url => url.trim());
        } else if (accommodation.images.trim()) {
          return [accommodation.images.trim()];
        }
        return [];
      }
    })()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amenities: JSON.stringify(formData.amenities.split(',').map((a: string) => a.trim())),
      images: JSON.stringify(imageUrls),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="acc-name">Name</Label>
          <Input
            id="acc-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="acc-type">Type</Label>
          <select
            id="acc-type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="hotel">Hotel</option>
            <option value="lodge">Lodge</option>
            <option value="cabin">Cabin</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="acc-description">Description</Label>
        <Textarea
          id="acc-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="acc-location">Location</Label>
          <Input
            id="acc-location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="acc-price">Price per Night</Label>
          <Input
            id="acc-price"
            type="number"
            value={formData.pricePerNight}
            onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="acc-guests">Max Guests</Label>
          <Input
            id="acc-guests"
            type="number"
            value={formData.maxGuests}
            onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="acc-amenities">Amenities (comma-separated)</Label>
        <Input
          id="acc-amenities"
          value={formData.amenities}
          onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
          placeholder="WiFi, Restaurant, Pool, etc."
        />
      </div>

      <div>
        <Label>Images</Label>
        <ImageUpload
          images={imageUrls}
          onImagesChange={setImageUrls}
          maxImages={10}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : (accommodation ? "Update Accommodation" : "Create Accommodation")}
        </Button>
      </DialogFooter>
    </form>
  );
}