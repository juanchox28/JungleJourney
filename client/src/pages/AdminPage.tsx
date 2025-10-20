import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("tours");
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null);
  const [isTourDialogOpen, setIsTourDialogOpen] = useState(false);
  const [isAccommodationDialogOpen, setIsAccommodationDialogOpen] = useState(false);
  const [deletingTourId, setDeletingTourId] = useState<string | null>(null);
  const [deletingAccommodationId, setDeletingAccommodationId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Authentication
  const handleLogin = () => {
    if (adminPassword === "admin123") {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuthenticated", "true");
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  // Check if already authenticated
  useState(() => {
    if (localStorage.getItem("adminAuthenticated") === "true") {
      setIsAuthenticated(true);
    }
  });

  // Data fetching
  const { data: tours = [] } = useQuery({
    queryKey: ["tours"],
    queryFn: async () => {
      const response = await fetch("/api/tours");
      if (!response.ok) throw new Error("Failed to fetch tours");
      return response.json() as Promise<Tour[]>;
    },
    enabled: isAuthenticated,
  });

  const { data: accommodations = [] } = useQuery({
    queryKey: ["accommodations"],
    queryFn: async () => {
      const response = await fetch("/api/accommodations");
      if (!response.ok) throw new Error("Failed to fetch accommodations");
      return response.json() as Promise<Accommodation[]>;
    },
    enabled: isAuthenticated,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const response = await fetch("/api/admin/bookings", {
        headers: { Authorization: `Bearer admin123` },
      });
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json() as Promise<Booking[]>;
    },
    enabled: isAuthenticated,
  });

  // Mutations
  const createTourMutation = useMutation({
    mutationFn: async (tourData: any) => {
      const response = await fetch("/api/admin/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer admin123`,
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
      const response = await fetch(`/api/admin/tours/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer admin123`,
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
      const response = await fetch(`/api/admin/tours/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer admin123`,
        },
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
      const response = await fetch("/api/admin/accommodations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer admin123`,
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
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer admin123`,
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
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(parseInt(price) || 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter the admin password to access the management interface</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
            </div>
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
            <span className="text-gray-900 font-medium">Admin Dashboard</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Manage tours, accommodations, and bookings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tours">Tours ({tours.length})</TabsTrigger>
            <TabsTrigger value="accommodations">Accommodations ({accommodations.length})</TabsTrigger>
            <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
          </TabsList>

          {/* Tours Tab */}
          <TabsContent value="tours" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Tours Management</h2>
              <Dialog open={isTourDialogOpen} onOpenChange={setIsTourDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingTour(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tour
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingTour ? 'Edit Tour' : 'Add New Tour'}</DialogTitle>
                    <DialogDescription>
                      Fill in the tour details below
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
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.map((tourItem) => (
                      <TableRow key={tourItem.id}>
                        <TableCell className="font-medium">{tourItem.name}</TableCell>
                        <TableCell>{tourItem.location}</TableCell>
                        <TableCell>{formatPrice(tourItem.basePrice || "0")}</TableCell>
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
                                if (confirm(`Are you sure you want to delete "${tourItem.name}"?`)) {
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
              <h2 className="text-2xl font-bold">Accommodations Management</h2>
              <Dialog open={isAccommodationDialogOpen} onOpenChange={setIsAccommodationDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingAccommodation(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Accommodation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingAccommodation ? 'Edit Accommodation' : 'Add New Accommodation'}</DialogTitle>
                    <DialogDescription>
                      Fill in the accommodation details below
                    </DialogDescription>
                  </DialogHeader>
                  <AccommodationForm
                    accommodation={editingAccommodation}
                    onSubmit={(data) => createAccommodationMutation.mutate(data)}
                    isLoading={createAccommodationMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price/Night</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accommodations.map((accommodation) => (
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
                                if (confirm(`Are you sure you want to delete "${accommodation.name}"?`)) {
                                  // deleteAccommodationMutation.mutate(accommodation.id);
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
      images: JSON.stringify(imageUrls),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
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
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="basePrice">Base Price</Label>
          <Input
            id="basePrice"
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
          />
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