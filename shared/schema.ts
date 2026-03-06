import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  serviceType: text("service_type").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("pending"),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true });

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Request types
export type CreateEventRequest = InsertEvent;
export type UpdateEventRequest = Partial<InsertEvent>;

// Response types
export type EventResponse = Event;
export type EventsListResponse = Event[];
