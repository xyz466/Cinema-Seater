import { motion } from "framer-motion";
import { type Seat } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Armchair } from "lucide-react";

interface SeatMapProps {
  seats: Seat[];
  selectedSeatIds: number[];
  onToggleSeat: (seatId: number) => void;
}

export function SeatMap({ seats, selectedSeatIds, onToggleSeat }: SeatMapProps) {
  // Group seats by row
  const rows = [...new Set(seats.map((s) => s.row))].sort();
  
  // Calculate grid dimensions
  const maxSeatNum = Math.max(...seats.map(s => s.number));

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 perspective-1000">
      {/* Screen */}
      <div className="mb-12 relative">
        <div className="h-2 w-3/4 mx-auto bg-white/20 rounded-full blur-[2px] screen-glow" />
        <div className="h-16 w-3/4 mx-auto bg-gradient-to-b from-primary/20 to-transparent transform perspective-3d rotate-x-12 opacity-50 mask-image-gradient" />
        <p className="text-center text-xs tracking-[0.5em] text-muted-foreground mt-4 font-mono uppercase">Screen</p>
      </div>

      {/* Seats Grid */}
      <div className="flex flex-col gap-3 md:gap-4 items-center">
        {rows.map((row) => {
          const rowSeats = seats.filter((s) => s.row === row).sort((a, b) => a.number - b.number);
          
          return (
            <div key={row} className="flex items-center gap-2 md:gap-4">
              <span className="w-6 text-center text-sm font-bold text-muted-foreground font-mono">{row}</span>
              
              <div className="flex gap-2 md:gap-3">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeatIds.includes(seat.id);
                  const isBooked = seat.isBooked;

                  return (
                    <motion.button
                      key={seat.id}
                      whileHover={!isBooked ? { scale: 1.1, y: -2 } : {}}
                      whileTap={!isBooked ? { scale: 0.95 } : {}}
                      onClick={() => !isBooked && onToggleSeat(seat.id)}
                      disabled={isBooked}
                      className={cn(
                        "relative group w-8 h-8 md:w-10 md:h-10 rounded-t-lg transition-all duration-300 flex items-center justify-center",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                        // Base State
                        !isBooked && !isSelected && "text-muted-foreground/30 hover:text-primary hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]",
                        // Selected State
                        isSelected && "text-primary shadow-[0_0_20px_rgba(124,58,237,0.5)] z-10",
                        // Booked State
                        isBooked && "text-white/5 cursor-not-allowed"
                      )}
                      aria-label={`Row ${row} Seat ${seat.number} ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                    >
                      <Armchair 
                        className={cn(
                          "w-full h-full fill-current stroke-[1.5px]",
                          // Fill selected seats completely
                          isSelected && "fill-primary text-primary",
                          // Booked seats are just outlines or very dim
                          isBooked && "fill-white/5 text-transparent stroke-white/10"
                        )} 
                      />
                      
                      {/* Tooltip for seat number */}
                      <span className="absolute -top-8 bg-popover border border-white/10 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        {row}{seat.number}
                        {isBooked && seat.bookedBy && <span className="block text-white/50">By: {seat.bookedBy}</span>}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              
              <span className="w-6 text-center text-sm font-bold text-muted-foreground font-mono">{row}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
