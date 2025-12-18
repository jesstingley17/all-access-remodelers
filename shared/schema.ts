import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  service: text("service").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

export const insertContactSchema = createInsertSchema(contacts, {
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  phone: z.string().optional(),
  service: z.string().min(1, "Please select a service"),
  message: z.string().min(1, "Message is required").max(2000),
}).pick({
  name: true,
  email: true,
  phone: true,
  service: true,
  message: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  service: text("service"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).pick({
  name: true,
  location: true,
  rating: true,
  text: true,
  service: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGalleryItemSchema = createInsertSchema(galleryItems).pick({
  title: true,
  description: true,
  category: true,
  imageUrl: true,
});

export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;
export type GalleryItem = typeof galleryItems.$inferSelect;

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  propertyAddress: text("property_address").notNull(),
  issueType: text("issue_type").notNull(),
  description: text("description").notNull(),
  urgency: text("urgency").notNull(),
  preferredContactTime: text("preferred_contact_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false),
});

export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests, {
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  phone: z.string().min(1, "Phone is required"),
  propertyAddress: z.string().min(1, "Property address is required").max(200),
  issueType: z.string().min(1, "Please select an issue type"),
  description: z.string().min(1, "Description is required").max(2000),
  urgency: z.string().min(1, "Please select urgency level"),
  preferredContactTime: z.string().min(1, "Preferred contact time is required"),
}).pick({
  name: true,
  email: true,
  phone: true,
  propertyAddress: true,
  issueType: true,
  description: true,
  urgency: true,
  preferredContactTime: true,
});

export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
