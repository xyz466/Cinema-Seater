import { z } from 'zod';
import { seats, insertSeatSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  seats: {
    list: {
      method: 'GET' as const,
      path: '/api/seats',
      responses: {
        200: z.array(z.custom<typeof seats.$inferSelect>()),
      },
    },
    book: {
      method: 'POST' as const,
      path: '/api/bookings',
      input: z.object({
        seatIds: z.array(z.number()),
        bookedBy: z.string().min(1, "Name is required"),
      }),
      responses: {
        200: z.object({ message: z.string(), bookedSeats: z.array(z.number()) }),
        400: errorSchemas.validation,
        409: z.object({ message: z.string() }), // Conflict if already booked
      },
    },
    reset: { // Helper to clear all bookings for demo
      method: 'POST' as const,
      path: '/api/reset',
      responses: {
        200: z.object({ message: z.string() }),
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
