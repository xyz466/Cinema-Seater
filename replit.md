# Cinema Seat Booking System

## Overview

A full-stack cinema seat reservation application that allows users to browse available seats across different theater sections, select seats manually or use an auto-find feature, and complete bookings. The system features a tiered seating layout (Royal, Prime Plus, Prime, Classic) with real-time seat availability updates and a modern dark-themed UI designed for cinema environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state with automatic polling (5-second intervals for seat availability)
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for smooth seat selection and UI transitions
- **Build Tool**: Vite with custom path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: connect-pg-simple for PostgreSQL-backed sessions

### Data Storage
- **Database**: PostgreSQL (connection via DATABASE_URL environment variable)
- **Schema Location**: shared/schema.ts defines the seats table
- **Migrations**: Drizzle Kit with migrations stored in /migrations folder
- **Seating Model**: 12 rows × 10 columns with 4 pricing tiers based on row position

### API Structure
- `GET /api/seats` - List all seats with booking status
- `GET /api/seats/find?section=&count=` - Auto-find continuous seat blocks in a tier
- `POST /api/bookings` - Book selected seats with name validation
- `POST /api/reset` - Reset all bookings (demo functionality)

### Key Design Decisions

1. **Shared Code Pattern**: The `/shared` directory contains schema definitions and route contracts used by both frontend and backend, ensuring type safety across the stack.

2. **Optimistic Polling**: Frontend polls seat data every 5 seconds to handle concurrent bookings in a multi-user cinema scenario rather than using WebSockets for simplicity.

3. **Atomic Booking Transactions**: Database transactions ensure seats cannot be double-booked when multiple users attempt to reserve simultaneously.

4. **Tiered Seating Algorithm**: The find-seats endpoint implements a cluster-finding algorithm to locate continuous seat blocks within specified sections.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, required via DATABASE_URL environment variable
- **Drizzle Kit**: Schema push command `npm run db:push` for database migrations

### UI Component Library
- **shadcn/ui**: Pre-configured with Radix UI primitives (dialog, select, toast, tooltip, etc.)
- **Lucide React**: Icon library used throughout the interface

### Build & Development
- **Vite**: Development server with HMR and production bundling
- **esbuild**: Server-side bundling for production builds
- **Replit Plugins**: Development banner and cartographer for Replit environment

### Validation
- **Zod**: Runtime type validation for API inputs/outputs
- **drizzle-zod**: Generates Zod schemas from Drizzle table definitions