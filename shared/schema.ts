import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const tours = pgTable("tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category"),
  description: text("description"),
  detalle: text("detalle"),
  duration: text("duration"),
  location: text("location"),
  price2: text("price_2"),
  price3: text("price_3"),
  price4: text("price_4"),
  price5: text("price_5"),
  price6: text("price_6"),
  basePrice: text("base_price"),
  ref: text("ref"),
  images: text("images"),
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
});

export type InsertTour = z.infer<typeof insertTourSchema>;
export type Tour = typeof tours.$inferSelect;

export const accommodations = pgTable("accommodations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // hotel, lodge, cabin, etc.
  description: text("description"),
  location: text("location"),
  pricePerNight: text("price_per_night"),
  amenities: text("amenities"), // JSON string of amenities
  images: text("images"), // JSON string of image URLs
  maxGuests: integer("max_guests"),
  availabilityStatus: text("availability_status").default("available"),
});

export const insertAccommodationSchema = createInsertSchema(accommodations).omit({
  id: true,
});

export type InsertAccommodation = z.infer<typeof insertAccommodationSchema>;
export type Accommodation = typeof accommodations.$inferSelect;

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accommodationId: varchar("accommodation_id").references(() => accommodations.id),
  tourId: varchar("tour_id").references(() => tours.id),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestCount: integer("guest_count").notNull(),
  checkInDate: text("check_in_date"),
  checkOutDate: text("check_out_date"),
  tourDate: text("tour_date"),
  totalPrice: text("total_price"),
  status: text("status").default("pending"), // pending, confirmed, cancelled, payment_pending, payment_failed
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  reference: text("reference"), // Unique booking reference
  wompiPaymentId: text("wompi_payment_id"), // Wompi payment link ID
  checkoutUrl: text("checkout_url"), // Wompi checkout URL
  paymentStatus: text("payment_status"), // APPROVED, DECLINED, PENDING, etc.
  paymentData: text("payment_data"), // JSON string of payment details
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
