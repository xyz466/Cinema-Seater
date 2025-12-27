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
      const sections = [
        { name: "Royal", rows: 1, cols: 14 },
        { name: "Prime Plus", rows: 4, cols: 16 },
        { name: "Prime", rows: 3, cols: 16 },
        { name: "Classic", rows: 2, cols: 16 }
      ];

      // Sections are ordered Back to Front in the UI, 
      // but let's seed them in a logical order.
      for (const section of sections) {
        for (let r = 0; r < section.rows; r++) {
          const rowLabel = `${section.name.charAt(0)}${r + 1}`;
          for (let c = 1; c <= section.cols; c++) {
            allSeats.push({
              section: section.name,
              row: rowLabel,
              number: c,
              isBooked: false,
              bookedBy: null
            });
          }
        }
      }
      
      await db.insert(seats).values(allSeats);
    }
  }

  async findSeats(section: string, count: number): Promise<Seat[] | null> {
    const allSeats = await this.getSeats();
    const sectionSeats = allSeats.filter(s => s.section === section);
    
    // Group by row
    const rows: Record<string, Seat[]> = {};
    sectionSeats.forEach(s => {
      if (!rows[s.row]) rows[s.row] = [];
      rows[s.row].push(s);
    });

    const clusters: { length: number, seats: Seat[] }[] = [];

    for (const rowLabel in rows) {
      const row = rows[rowLabel].sort((a, b) => a.number - b.number);
      let currentCluster: Seat[] = [];

      for (const seat of row) {
        if (!seat.isBooked) {
          currentCluster.push(seat);
        } else {
          if (currentCluster.length > 0) {
            clusters.push({ length: currentCluster.length, seats: [...currentCluster] });
          }
          currentCluster = [];
        }
      }
      if (currentCluster.length > 0) {
        clusters.push({ length: currentCluster.length, seats: currentCluster });
      }
    }

    // Greedy: smallest cluster that fits the count
    const validClusters = clusters
      .filter(c => c.length >= count)
      .sort((a, b) => a.length - b.length);

    if (validClusters.length === 0) return null;

    // Return the first 'count' seats from the best cluster
    return validClusters[0].seats.slice(0, count);
  }
}

export const storage = new DatabaseStorage();
