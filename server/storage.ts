import { db } from "./db";
import { seats, type Seat, type InsertSeat } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

export interface IStorage {
  getSeats(): Promise<Seat[]>;
  bookSeats(seatIds: number[], bookedBy: string): Promise<number[]>; // Returns booked seat IDs
  resetSeats(): Promise<void>;
  seedSeats(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getSeats(): Promise<Seat[]> {
    return await db.select().from(seats).orderBy(seats.row, seats.number);
  }

  async bookSeats(seatIds: number[], bookedBy: string): Promise<number[]> {
    // Transaction to ensure atomicity and avoid double booking
    return await db.transaction(async (tx) => {
      // 1. Check if any are already booked
      const existing = await tx
        .select()
        .from(seats)
        .where(inArray(seats.id, seatIds));
      
      const alreadyBooked = existing.filter(s => s.isBooked);
      if (alreadyBooked.length > 0) {
        throw new Error(`Seats ${alreadyBooked.map(s => `${s.row}${s.number}`).join(', ')} are already booked.`);
      }

      // 2. Book them
      await tx
        .update(seats)
        .set({ isBooked: true, bookedBy })
        .where(inArray(seats.id, seatIds));
      
      return seatIds;
    });
  }

  async resetSeats(): Promise<void> {
    await db.update(seats).set({ isBooked: false, bookedBy: null });
  }

  async seedSeats(): Promise<void> {
    const existing = await db.select().from(seats).limit(1);
    if (existing.length === 0) {
      const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
      const seatsPerRow = 8;
      const allSeats: InsertSeat[] = [];

      for (const row of rows) {
        for (let i = 1; i <= seatsPerRow; i++) {
          allSeats.push({
            row,
            number: i,
            isBooked: false,
            bookedBy: null
          });
        }
      }
      
      await db.insert(seats).values(allSeats);
    }
  }
}

export const storage = new DatabaseStorage();
