import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const existing = await storage.getAppointments();
  if (existing.length === 0) {
    const now = new Date();
    await storage.createAppointment({ 
      clientName: "Jane Doe",
      clientEmail: "jane@example.com",
      serviceType: "Facial Treatment",
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0)
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  seedDatabase().catch(console.error);

  app.get(api.appointments.list.path, async (req, res) => {
    const list = await storage.getAppointments();
    res.json(list);
  });

  app.post(api.appointments.create.path, async (req, res) => {
    try {
      const bodySchema = api.appointments.create.input.extend({
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
      });
      const input = bodySchema.parse(req.body);
      const item = await storage.createAppointment(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.delete(api.appointments.delete.path, async (req, res) => {
    try {
      await storage.deleteAppointment(Number(req.params.id));
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  return httpServer;
}
