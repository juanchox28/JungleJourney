import { type User, type InsertUser, type Tour, type InsertTour, type Accommodation, type InsertAccommodation, type Booking, type InsertBooking } from "@shared/schema";
import { randomUUID } from "crypto";
import toursJsonData from "../attached_assets/tours_data.json";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getTours(filters?: { location?: string; category?: string }): Promise<Tour[]>;
  getTour(id: string): Promise<Tour | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;

  getAccommodations(filters?: { location?: string; type?: string }): Promise<Accommodation[]>;
  getAccommodation(id: string): Promise<Accommodation | undefined>;
  createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation>;

  getBookings(): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
}

function parseLocation(locationStr: string): string {
  if (!locationStr) return '';
  if (locationStr.includes('Leticia')) return 'leticia';
  if (locationStr.includes('Puerto Nariño') || locationStr.includes('Puerto Narino')) return 'puerto-narino';
  if (locationStr.includes('Mocagua')) return 'mocagua';
  return '';
}

function cleanPrice(priceStr: string): string {
  if (!priceStr) return '';
  return priceStr
    .replace(/\./g, '') // Remove all dots
    .replace(/,00\s*COP\s*$/i, '') // Remove ",00 COP" at end (case insensitive)
    .replace(/[^\d]/g, '') // Remove any remaining non-digits
    .trim();
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tours: Map<string, Tour>;
  private accommodations: Map<string, Accommodation>;
  private bookings: Map<string, Booking>;

  constructor() {
    this.users = new Map();
    this.tours = new Map();
    this.accommodations = new Map();
    this.bookings = new Map();
    this.initializeTours();
    this.initializeAccommodations();
  }

  private initializeTours() {
    const rawTours = toursJsonData as any[];
    
    rawTours.forEach((rawTour) => {
      if (!rawTour.name || rawTour.name.trim() === '') return;
      if (rawTour.category === '' && rawTour.description === '') return;
      
      const id = randomUUID();
      const tour: Tour = {
        id,
        name: rawTour.name || '',
        category: rawTour.category || '',
        description: rawTour.description || '',
        detalle: rawTour.detalle || '',
        duration: rawTour.duration || '',
        location: parseLocation(rawTour.location),
        price2: cleanPrice(rawTour.price_2),
        price3: cleanPrice(rawTour.price_3),
        price4: cleanPrice(rawTour.price_4),
        price5: cleanPrice(rawTour.price_5),
        price6: cleanPrice(rawTour.price_6),
        basePrice: cleanPrice(rawTour.base_price),
        ref: rawTour.ref || '',
        images: rawTour.images || '',
      };
      
      this.tours.set(id, tour);
    });
    
    console.log(`Initialized ${this.tours.size} tours in memory storage`);
  }

  private initializeAccommodations() {
    // Sample accommodations data
    const sampleAccommodations: Accommodation[] = [
      {
        id: randomUUID(),
        name: "Amazon River Lodge",
        type: "lodge",
        description: "Luxurious riverside lodge with stunning Amazon views",
        location: "leticia",
        pricePerNight: "250000",
        amenities: JSON.stringify(["WiFi", "Restaurant", "Bar", "Guided Tours", "Spa"]),
        images: JSON.stringify(["/images/lodge1.jpg", "/images/lodge2.jpg"]),
        maxGuests: 4,
        availabilityStatus: "available"
      },
      {
        id: randomUUID(),
        name: "Jungle Cabins",
        type: "cabin",
        description: "Authentic wooden cabins immersed in the rainforest",
        location: "puerto-narino",
        pricePerNight: "180000",
        amenities: JSON.stringify(["Private Bathroom", "Mosquito Nets", "Eco-Toilets", "Hiking Trails"]),
        images: JSON.stringify(["/images/cabin1.jpg", "/images/cabin2.jpg"]),
        maxGuests: 2,
        availabilityStatus: "available"
      },
      {
        id: randomUUID(),
        name: "Riverside Hotel",
        type: "hotel",
        description: "Modern hotel with river views and city access",
        location: "leticia",
        pricePerNight: "320000",
        amenities: JSON.stringify(["Pool", "Restaurant", "Room Service", "Conference Room", "Laundry"]),
        images: JSON.stringify(["/images/hotel1.jpg", "/images/hotel2.jpg"]),
        maxGuests: 6,
        availabilityStatus: "available"
      }
    ];

    sampleAccommodations.forEach(accommodation => {
      this.accommodations.set(accommodation.id, accommodation);
    });

    console.log(`Initialized ${this.accommodations.size} accommodations in memory storage`);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTours(filters?: { location?: string; category?: string }): Promise<Tour[]> {
    let tours = Array.from(this.tours.values());
    
    if (filters?.location) {
      tours = tours.filter(tour => tour.location === filters.location);
    }
    
    if (filters?.category) {
      tours = tours.filter(tour => tour.category === filters.category);
    }
    
    return tours;
  }

  async getTour(id: string): Promise<Tour | undefined> {
    return this.tours.get(id);
  }

  async createTour(insertTour: InsertTour): Promise<Tour> {
    const id = randomUUID();
    const tour: Tour = {
      id,
      name: insertTour.name,
      category: insertTour.category ?? null,
      description: insertTour.description ?? null,
      detalle: insertTour.detalle ?? null,
      duration: insertTour.duration ?? null,
      location: insertTour.location ?? null,
      price2: insertTour.price2 ?? null,
      price3: insertTour.price3 ?? null,
      price4: insertTour.price4 ?? null,
      price5: insertTour.price5 ?? null,
      price6: insertTour.price6 ?? null,
      basePrice: insertTour.basePrice ?? null,
      ref: insertTour.ref ?? null,
      images: insertTour.images ?? null,
    };
    this.tours.set(id, tour);
    return tour;
  }

  async getAccommodations(filters?: { location?: string; type?: string }): Promise<Accommodation[]> {
    let accommodations = Array.from(this.accommodations.values());

    if (filters?.location) {
      accommodations = accommodations.filter(acc => acc.location === filters.location);
    }

    if (filters?.type) {
      accommodations = accommodations.filter(acc => acc.type === filters.type);
    }

    return accommodations;
  }

  async getAccommodation(id: string): Promise<Accommodation | undefined> {
    return this.accommodations.get(id);
  }

  async createAccommodation(insertAccommodation: InsertAccommodation): Promise<Accommodation> {
    const id = randomUUID();
    const accommodation: Accommodation = {
      id,
      name: insertAccommodation.name,
      type: insertAccommodation.type,
      description: insertAccommodation.description ?? null,
      location: insertAccommodation.location ?? null,
      pricePerNight: insertAccommodation.pricePerNight ?? null,
      amenities: insertAccommodation.amenities ?? null,
      images: insertAccommodation.images ?? null,
      maxGuests: insertAccommodation.maxGuests ?? null,
      availabilityStatus: insertAccommodation.availabilityStatus ?? "available",
    };
    this.accommodations.set(id, accommodation);
    return accommodation;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      id,
      accommodationId: insertBooking.accommodationId ?? null,
      tourId: insertBooking.tourId ?? null,
      guestName: insertBooking.guestName,
      guestEmail: insertBooking.guestEmail,
      guestCount: insertBooking.guestCount,
      checkInDate: insertBooking.checkInDate ?? null,
      checkOutDate: insertBooking.checkOutDate ?? null,
      tourDate: insertBooking.tourDate ?? null,
      totalPrice: insertBooking.totalPrice ?? null,
      status: insertBooking.status ?? "pending",
      createdAt: insertBooking.createdAt ?? new Date().toISOString(),
      reference: insertBooking.reference ?? null,
      wompiPaymentId: insertBooking.wompiPaymentId ?? null,
      checkoutUrl: insertBooking.checkoutUrl ?? null,
      paymentStatus: insertBooking.paymentStatus ?? null,
      paymentData: insertBooking.paymentData ?? null,
    };
    this.bookings.set(id, booking);
    return booking;
  }
}

export const storage = new MemStorage();
