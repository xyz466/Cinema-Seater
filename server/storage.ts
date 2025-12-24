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
    return await db.select().from(seats).orderBy(seats.section, seats.row, seats.number);
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
      const allSeats: InsertSeat[] = [];

      // Lower Section: 38 seats (4 rows of 8 + 1 row of 6)
      const lowerRows = ['A', 'B', 'C', 'D'];
      for (const row of lowerRows) {
        for (let i = 1; i <= 8; i++) {
          allSeats.push({ section: 'lower', row, number: i, isBooked: false, bookedBy: null });
        }
      }
      // Last row of lower with 6 seats
      for (let i = 1; i <= 6; i++) {
        allSeats.push({ section: 'lower', row: 'E', number: i, isBooked: false, bookedBy: null });
      }

      // Middle Section: 92 seats (10 rows of 9 + 1 row of 2)
      const middleRows = ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
      for (const row of middleRows) {
        for (let i = 1; i <= 9; i++) {
          allSeats.push({ section: 'middle', row, number: i, isBooked: false, bookedBy: null });
        }
      }
      // Last row of middle with 2 seats
      for (let i = 1; i <= 2; i++) {
        allSeats.push({ section: 'middle', row: 'P', number: i, isBooked: false, bookedBy: null });
      }

      // Balcony Section: 150 seats (15 rows of 10)
      const balconyRows = ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE'];
      for (const row of balconyRows) {
        for (let i = 1; i <= 10; i++) {
          allSeats.push({ section: 'balcony', row, number: i, isBooked: false, bookedBy: null });
        }
      }
      
      await db.insert(seats).values(allSeats);
    }
  }
}

export const storage = new DatabaseStorage();
