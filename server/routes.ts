import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize seed data
  await storage.seedSeats();

  app.get(api.seats.list.path, async (req, res) => {
    const allSeats = await storage.getSeats();
    res.json(allSeats);
  });

  app.post(api.seats.book.path, async (req, res) => {
    try {
      const input = api.seats.book.input.parse(req.body);
      await storage.bookSeats(input.seatIds, input.bookedBy);
      res.json({ message: "Booking successful", bookedSeats: input.seatIds });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      if (err instanceof Error) {
        // Simple conflict handling
        return res.status(409).json({ message: err.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.seats.reset.path, async (req, res) => {
    await storage.resetSeats();
    res.json({ message: "All bookings cleared" });
  });

  return httpServer;
}
