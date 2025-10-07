import { type User, type InsertUser, type Tour, type InsertTour } from "@shared/schema";
import { randomUUID } from "crypto";
import toursJsonData from "../attached_assets/tours_data.json";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTours(filters?: { location?: string; category?: string }): Promise<Tour[]>;
  getTour(id: string): Promise<Tour | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;
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
  return priceStr.replace('.', '').replace(',00 COP', '').trim();
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tours: Map<string, Tour>;

  constructor() {
    this.users = new Map();
    this.tours = new Map();
    this.initializeTours();
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
}

export const storage = new MemStorage();
