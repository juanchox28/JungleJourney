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
