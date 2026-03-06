import { db } from "./db";
import {
  appointments,
  type InsertAppointment,
  type Appointment
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [created] = await db.insert(appointments).values(appointment).returning();
    return created;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }
}

export const storage = new DatabaseStorage();
