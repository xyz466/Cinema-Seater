import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const seats = pgTable("seats", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(), // "Royal", "Prime Plus", "Prime", "Classic"
  row: text("row").notNull(),
  number: integer("number").notNull(),
  isBooked: boolean("is_booked").default(false),
  bookedBy: text("booked_by"), // Nullable, name of person who booked
});

export const insertSeatSchema = createInsertSchema(seats).omit({ id: true });

// API Types
export type Seat = typeof seats.$inferSelect;
export type InsertSeat = z.infer<typeof insertSeatSchema>;

export type BookSeatsRequest = {
  seatIds: number[];
  bookedBy: string;
};

// Response for seat grid
export type SeatResponse = Seat;
