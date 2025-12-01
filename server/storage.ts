import { type User, type InsertUser, type Tour, type InsertTour, type Accommodation, type InsertAccommodation, type Booking, type InsertBooking } from "../shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getTours(filters?: { location?: string; category?: string }): Promise<Tour[]>;
  getTour(id: string): Promise<Tour | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: string, tour: Partial<InsertTour>): Promise<Tour | undefined>;
  deleteTour(id: string): Promise<boolean>;

  getAccommodations(filters?: { location?: string; type?: string }): Promise<Accommodation[]>;
  getAccommodation(id: string): Promise<Accommodation | undefined>;
  createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation>;
  updateAccommodation(id: string, accommodation: Partial<InsertAccommodation>): Promise<Accommodation | undefined>;
  deleteAccommodation(id: string): Promise<boolean>;

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
  private toursFilePath: string;
  private accommodationsFilePath: string;

  constructor() {
    this.users = new Map();
    this.tours = new Map();
    this.accommodations = new Map();
    this.bookings = new Map();

    // Use server directory for data files in production, client/public in development
    const isProduction = process.env.NODE_ENV === 'production';
    const dataDir = isProduction ? 'server' : 'client/public';

    this.toursFilePath = path.join(process.cwd(), dataDir, "tours_data.json");
    this.accommodationsFilePath = path.join(process.cwd(), dataDir, "accommodations_data.json");
  }

  async init() {
    await this.initializeTours();
    await this.initializeAccommodations();
    console.log('✅ Storage initialized');
  }

  private async persistTours(): Promise<void> {
    const toursArray = Array.from(this.tours.values());
    await fs.writeFile(this.toursFilePath, JSON.stringify(toursArray, null, 2));
  }

  private async persistAccommodations(): Promise<void> {
    const accommodationsArray = Array.from(this.accommodations.values());
    await fs.writeFile(this.accommodationsFilePath, JSON.stringify(accommodationsArray, null, 2));
  }

  private async initializeTours() {
    try {
      console.log(`📂 Attempting to load tours from: ${this.toursFilePath}`);
      const toursData = await fs.readFile(this.toursFilePath, "utf-8");
      console.log(`✅ Successfully read tours file`);

      const rawTours = JSON.parse(toursData) as any[];
      console.log(`📋 Found ${rawTours.length} raw tours`);

      rawTours.forEach((rawTour) => {
        if (!rawTour.name || rawTour.name.trim() === '') return;
        if (rawTour.category === '' && rawTour.description === '') return;

        const id = rawTour.id || randomUUID();
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
          bookingAdvanceHours: rawTour.booking_advance_hours || 24,
        };

        this.tours.set(id, tour);
      });

      console.log(`✅ Initialized ${this.tours.size} tours in memory storage from ${this.toursFilePath}`);
    } catch (error) {
      console.error(`❌ Error reading or parsing tours data from ${this.toursFilePath}:`, error);
      console.error(`Full error details:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as any).code,
        path: this.toursFilePath
      });
    }
  }

  private async initializeAccommodations() {
    try {
      const accommodationsData = await fs.readFile(this.accommodationsFilePath, "utf-8");
      const rawAccommodations = JSON.parse(accommodationsData) as any[];

      rawAccommodations.forEach((accommodation) => {
        if (accommodation.id) {
          this.accommodations.set(accommodation.id, accommodation as Accommodation);
        }
      });

      console.log(`Initialized ${this.accommodations.size} accommodations in memory storage from ${this.accommodationsFilePath}`);
    } catch (error) {
      console.error(`Error reading or parsing accommodations data from ${this.accommodationsFilePath}:`, error);
    }
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
      bookingAdvanceHours: insertTour.bookingAdvanceHours ?? 24,
    };
    this.tours.set(id, tour);
    await this.persistTours();
    return tour;
  }

  async updateTour(id: string, insertTour: Partial<InsertTour>): Promise<Tour | undefined> {
    const tour = this.tours.get(id);
    if (!tour) return undefined;

    const updatedTour = { ...tour, ...insertTour };
    this.tours.set(id, updatedTour);
    await this.persistTours();
    return updatedTour;
  }

  async deleteTour(id: string): Promise<boolean> {
    const success = this.tours.delete(id);
    if (success) {
      await this.persistTours();
    }
    return success;
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
    await this.persistAccommodations();
    return accommodation;
  }

  async updateAccommodation(id: string, insertAccommodation: Partial<InsertAccommodation>): Promise<Accommodation | undefined> {
    const accommodation = this.accommodations.get(id);
    if (!accommodation) return undefined;

    const updatedAccommodation = { ...accommodation, ...insertAccommodation };
    this.accommodations.set(id, updatedAccommodation);
    await this.persistAccommodations();
    return updatedAccommodation;
  }

  async deleteAccommodation(id: string): Promise<boolean> {
    const success = this.accommodations.delete(id);
    if (success) {
      await this.persistAccommodations();
    }
    return success;
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
      paymentMethod: insertBooking.paymentMethod ?? null,
      participants: insertBooking.participants ?? null,
      isRoundTrip: insertBooking.isRoundTrip ?? 0,
      returnDate: insertBooking.returnDate ?? null,
      returnTime: insertBooking.returnTime ?? null,
      returnRouteId: insertBooking.returnRouteId ?? null,
    };
    this.bookings.set(id, booking);
    return booking;
  }
}

export const storage = new MemStorage();
