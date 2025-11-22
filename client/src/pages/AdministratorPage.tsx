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

export default function AdministratorPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("overview");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [editingTour, setEditingTour] = useState<Tour | null>(null);
    const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null);
    const [isTourDialogOpen, setIsTourDialogOpen] = useState(false);
    const [isAccommodationDialogOpen, setIsAccommodationDialogOpen] = useState(false);
    const [priceChanges, setPriceChanges] = useState<Record<string, Partial<Tour>>>({});

    // Data fetching
    const { data: tours = [] } = useQuery({
        queryKey: ["admin-tours"],
        queryFn: async () => {
            const response = await fetch("/api/tours"); // Use public endpoint for reading
            if (!response.ok) throw new Error("Failed to fetch tours");
            return response.json() as Promise<Tour[]>;
        },
    });

    const { data: accommodations = [] } = useQuery({
        queryKey: ["admin-accommodations"],
        queryFn: async () => {
            const response = await fetch("/api/accommodations"); // Use public endpoint for reading
            if (!response.ok) throw new Error("Failed to fetch accommodations");
            return response.json() as Promise<Accommodation[]>;
        },
    });

    const { data: bookings = [] } = useQuery({
        queryKey: ["admin-bookings"],
        queryFn: async () => {
            const response = await fetch("/api/admin/bookings");
            if (!response.ok) throw new Error("Failed to fetch bookings");
            return response.json() as Promise<Booking[]>;
        },
    });

    // Mutations
    const createTourMutation = useMutation({
        mutationFn: async (tourData: any) => {
            const response = await fetch("/api/admin/tours", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tourData),
            });
            if (!response.ok) throw new Error("Failed to create tour");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-tours"] });
            setIsTourDialogOpen(false);
            setEditingTour(null);
            toast({ title: "Success", description: "Tour created successfully" });
        },
    });

    const updateTourMutation = useMutation({
        mutationFn: async ({ id, tourData }: { id: string; tourData: any }) => {
            const response = await fetch(`/api/admin/tours/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tourData),
            });
            if (!response.ok) throw new Error("Failed to update tour");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-tours"] });
            setIsTourDialogOpen(false);
            setEditingTour(null);
            toast({ title: "Success", description: "Tour updated successfully" });
        },
    });

    const deleteTourMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/admin/tours/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete tour");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-tours"] });
            toast({ title: "Success", description: "Tour deleted successfully" });
        },
    });

    const createAccommodationMutation = useMutation({
        mutationFn: async (accommodationData: any) => {
            const response = await fetch("/api/admin/accommodations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(accommodationData),
            });
            if (!response.ok) throw new Error("Failed to create accommodation");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
            setIsAccommodationDialogOpen(false);
            setEditingAccommodation(null);
            toast({ title: "Success", description: "Accommodation created successfully" });
        },
    });

    const updateAccommodationMutation = useMutation({
        mutationFn: async ({ id, accommodationData }: { id: string; accommodationData: any }) => {
            const response = await fetch(`/api/admin/accommodations/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(accommodationData),
            });
            if (!response.ok) throw new Error("Failed to update accommodation");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
            setIsAccommodationDialogOpen(false);
            setEditingAccommodation(null);
            toast({ title: "Success", description: "Accommodation updated successfully" });
        },
    });

    const deleteAccommodationMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/admin/accommodations/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete accommodation");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
            toast({ title: "Success", description: "Accommodation deleted successfully" });
        },
    });

    // Helper functions
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
            await updateTourMutation.mutateAsync({
                id: tourId,
                tourData: priceChanges[tourId]
            });
            setPriceChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[tourId];
                return newChanges;
            });
        } catch (error) {
            console.error("Error saving prices:", error);
        }
    };

    const hasUnsavedChanges = (tourId: string) => {
        const changes = priceChanges[tourId];
        if (!changes) return false;
        return Object.keys(changes).some(key => {
            const currentValue = changes[key as keyof Tour];
            const originalValue = tours.find(t => t.id === tourId)?.[key as keyof Tour];
            return currentValue !== originalValue;
        });
    };

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
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">📊 Resumen</TabsTrigger>
                        <TabsTrigger value="tours">🏞️ Tours</TabsTrigger>
                        <TabsTrigger value="pricing">💰 Precios</TabsTrigger>
                        <TabsTrigger value="accommodations">🏠 Alojamientos</TabsTrigger>
                        <TabsTrigger value="bookings">📅 Reservas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>⚡ Acciones Rápidas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("tours")}>
                                            ➕ Crear Nuevo Tour
                                        </Button>
                                        <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("pricing")}>
                                            💰 Gestionar Precios
                                        </Button>
                                        <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("accommodations")}>
                                            🏠 Agregar Alojamiento
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>🏞️ Tours Recientes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {tours.slice(0, 5).map((tour) => (
                                            <div key={tour.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{tour.name}</p>
                                                    <p className="text-sm text-gray-500">{tour.category}</p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => { setEditingTour(tour); setIsTourDialogOpen(true); setActiveTab("tours"); }}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
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

                        {['Dia Completo', 'Medio Dia', 'Nocturno', 'Con Alojamiento', 'Circuito / Tour', 'Medicinas ancestrales', 'Artesanías', 'Traslados'].map((category) => {
                            const categoryTours = tours.filter(t => t.category === category);
                            if (categoryTours.length === 0) return null;

                            return (
                                <Card key={category}>
                                    <CardHeader>
                                        <CardTitle>{category} ({categoryTours.length})</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Nombre</TableHead>
                                                    <TableHead>Ubicación</TableHead>
                                                    <TableHead>Precio Base</TableHead>
                                                    <TableHead>Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {categoryTours.map((tourItem) => (
                                                    <TableRow key={tourItem.id}>
                                                        <TableCell className="font-medium">{tourItem.name}</TableCell>
                                                        <TableCell>{tourItem.location}</TableCell>
                                                        <TableCell>{formatPrice(tourItem.basePrice || "0")}</TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => { setEditingTour(tourItem); setIsTourDialogOpen(true); }}>
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                                <Button variant="outline" size="sm" className="text-red-600" onClick={() => { if (confirm(`¿Eliminar "${tourItem.name}"?`)) deleteTourMutation.mutate(tourItem.id); }}>
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

                    <TabsContent value="pricing" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Gestión de Precios</h2>
                            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-tours"] })}>
                                🔄 Actualizar
                            </Button>
                        </div>
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Servicio</TableHead>
                                            <TableHead>1 Pax</TableHead>
                                            <TableHead>2 Pax</TableHead>
                                            <TableHead>3 Pax</TableHead>
                                            <TableHead>4 Pax</TableHead>
                                            <TableHead>5 Pax</TableHead>
                                            <TableHead>Base</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tours.map((tourItem) => (
                                            <TableRow key={tourItem.id}>
                                                <TableCell className="font-medium">{tourItem.name}</TableCell>
                                                <TableCell><Input type="number" value={priceChanges[tourItem.id]?.price2 ?? tourItem.price2 ?? '0'} onChange={(e) => updateTourPrice(tourItem.id, 'price2', e.target.value)} className="w-20" /></TableCell>
                                                <TableCell><Input type="number" value={priceChanges[tourItem.id]?.price3 ?? tourItem.price3 ?? ''} onChange={(e) => updateTourPrice(tourItem.id, 'price3', e.target.value)} className="w-20" /></TableCell>
                                                <TableCell><Input type="number" value={priceChanges[tourItem.id]?.price4 ?? tourItem.price4 ?? ''} onChange={(e) => updateTourPrice(tourItem.id, 'price4', e.target.value)} className="w-20" /></TableCell>
                                                <TableCell><Input type="number" value={priceChanges[tourItem.id]?.price5 ?? tourItem.price5 ?? ''} onChange={(e) => updateTourPrice(tourItem.id, 'price5', e.target.value)} className="w-20" /></TableCell>
                                                <TableCell><Input type="number" value={priceChanges[tourItem.id]?.price6 ?? tourItem.price6 ?? ''} onChange={(e) => updateTourPrice(tourItem.id, 'price6', e.target.value)} className="w-20" /></TableCell>
                                                <TableCell><Input type="number" value={priceChanges[tourItem.id]?.basePrice ?? tourItem.basePrice ?? ''} onChange={(e) => updateTourPrice(tourItem.id, 'basePrice', e.target.value)} className="w-20 bg-gray-50" /></TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm" onClick={() => saveTourPrices(tourItem.id)} disabled={!hasUnsavedChanges(tourItem.id)}>
                                                        💾
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {accommodations.map((acc) => (
                                <Card key={acc.id}>
                                    <CardHeader>
                                        <CardTitle>{acc.name}</CardTitle>
                                        <CardDescription>{acc.type} • {acc.location}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-lg font-bold mb-4">{formatPrice(acc.pricePerNight || "0")} / noche</p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" className="flex-1" onClick={() => { setEditingAccommodation(acc); setIsAccommodationDialogOpen(true); }}>
                                                <Edit className="w-4 h-4 mr-2" /> Editar
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => { if (confirm(`¿Eliminar "${acc.name}"?`)) deleteAccommodationMutation.mutate(acc.id); }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="bookings" className="space-y-6">
                        <h2 className="text-2xl font-bold">Reservas</h2>
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookings.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell>
                                                    <div className="font-medium">{booking.guestName}</div>
                                                    <div className="text-sm text-muted-foreground">{booking.guestEmail}</div>
                                                </TableCell>
                                                <TableCell>{booking.tourId ? 'Tour' : 'Alojamiento'}</TableCell>
                                                <TableCell><Badge variant="outline">{booking.status}</Badge></TableCell>
                                                <TableCell>{formatPrice(booking.totalPrice || "0")}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function TourForm({ tour, onSubmit, isLoading }: { tour?: Tour | null; onSubmit: (data: any) => void; isLoading: boolean; }) {
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
        images: tour?.images || "[]",
    });

    const [imageUrls, setImageUrls] = useState<string[]>(() => {
        try { return JSON.parse(tour?.images || "[]"); } catch { return []; }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, images: JSON.stringify(imageUrls) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Nombre</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div>
                    <Label>Categoría</Label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full border rounded-md px-3 py-2">
                        <option value="">Seleccionar...</option>
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
            <div><Label>Descripción</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Duración</Label><Input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} /></div>
                <div>
                    <Label>Ubicación</Label>
                    <select value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full border rounded-md px-3 py-2">
                        <option value="">Seleccionar...</option>
                        <option value="leticia">Leticia</option>
                        <option value="puerto-narino">Puerto Nariño</option>
                        <option value="mocagua">Mocagua</option>
                    </select>
                </div>
            </div>
            <div><Label>Imágenes</Label><ImageUpload images={imageUrls} onImagesChange={setImageUrls} maxImages={10} /></div>
            <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : "Guardar"}</Button></DialogFooter>
        </form>
    );
}

function AccommodationForm({ accommodation, onSubmit, isLoading }: { accommodation?: Accommodation | null; onSubmit: (data: any) => void; isLoading: boolean; }) {
    const [formData, setFormData] = useState({
        name: accommodation?.name || "",
        type: accommodation?.type || "hotel",
        description: accommodation?.description || "",
        location: accommodation?.location || "",
        pricePerNight: accommodation?.pricePerNight || "",
        amenities: accommodation?.amenities || "",
        maxGuests: accommodation?.maxGuests || 2,
        images: accommodation?.images || "[]",
    });

    const [imageUrls, setImageUrls] = useState<string[]>(() => {
        try { return JSON.parse(accommodation?.images || "[]"); } catch { return []; }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, images: JSON.stringify(imageUrls) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Nombre</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div>
                    <Label>Tipo</Label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full border rounded-md px-3 py-2">
                        <option value="hotel">Hotel</option>
                        <option value="lodge">Lodge</option>
                        <option value="cabin">Cabaña</option>
                    </select>
                </div>
            </div>
            <div><Label>Descripción</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Ubicación</Label><Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div>
                <div><Label>Precio/Noche</Label><Input type="number" value={formData.pricePerNight} onChange={e => setFormData({ ...formData, pricePerNight: e.target.value })} /></div>
            </div>
            <div><Label>Imágenes</Label><ImageUpload images={imageUrls} onImagesChange={setImageUrls} maxImages={10} /></div>
            <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? "Guardando..." : "Guardar"}</Button></DialogFooter>
        </form>
    );
}
