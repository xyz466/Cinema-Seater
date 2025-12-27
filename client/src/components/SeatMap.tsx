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
  // Group seats by section then row
  // Display order: Front to Back (Classic -> Prime -> Prime Plus -> Royal)
  // because screen is moved to bottom
  const sections = ["Classic", "Prime", "Prime Plus", "Royal"];
  const sectionLabels: Record<string, string> = {
    'Classic': 'Classic Section (Front) - 10 Rows',
    'Prime': 'Prime Section - 8 Rows',
    'Prime Plus': 'Prime Plus Section - 6 Rows',
    'Royal': 'Royal Section (Back) - 3 Rows'
  };
  
  const sectionColors: Record<string, string> = {
    'Royal': 'from-amber-500/20 to-amber-500/5',
    'Prime Plus': 'from-blue-500/20 to-blue-500/5',
    'Prime': 'from-purple-500/20 to-purple-500/5',
    'Classic': 'from-gray-500/20 to-gray-500/5'
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 perspective-1000">
      {/* Seats Grid - By Section */}
      <div className="flex flex-col gap-8 items-center mb-12">
        {sections.map((section) => {
          const sectionSeats = seats.filter((s) => s.section === section);

          return (
            <div key={section} className={`w-full border border-white/10 rounded-lg p-6 bg-gradient-to-b ${sectionColors[section]}`}>
              {/* Section Header */}
              <h3 className="text-center text-sm font-mono font-bold text-white mb-6 uppercase tracking-wider">{sectionLabels[section]}</h3>
              
              {/* Rows in Section */}
              <div className="flex flex-col gap-3 md:gap-4 items-center">
                {Array.from(new Set(sectionSeats.map((s) => s.row))).sort().map((row) => {
                  const rowSeats = sectionSeats.filter((s) => s.row === row).sort((a, b) => a.number - b.number);

                  return (
                    <div key={row} className="flex items-center gap-2 md:gap-4">
                      <span className="w-6 text-center text-sm font-bold text-muted-foreground font-mono">{row}</span>
                      
                      <div className="flex gap-2 md:gap-3">
                        {rowSeats.map((seat) => {
                          const isSelected = selectedSeatIds.includes(seat.id);
                          const isBooked = !!seat.isBooked;

                          return (
                            <motion.button
                              key={seat.id}
                              whileHover={!isBooked ? { scale: 1.1, y: -2 } : {}}
                              whileTap={!isBooked ? { scale: 0.95 } : {}}
                              onClick={() => !isBooked && onToggleSeat(seat.id)}
                              disabled={isBooked}
                              className={cn(
                                "relative group w-8 h-8 md:w-10 md:h-10 rounded-t-lg transition-all duration-300 flex items-center justify-center",
                                "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background",
                                // Base State - Gray for available
                                !isBooked && !isSelected && "text-gray-400 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]",
                                // Selected State - White
                                isSelected && "text-white shadow-[0_0_20px_rgba(255,255,255,0.5)] z-10",
                                // Booked State - Green
                                isBooked && "text-green-500 cursor-not-allowed"
                              )}
                              aria-label={`Row ${row} Seat ${seat.number} ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                            >
                              <Armchair 
                                className={cn(
                                  "w-full h-full fill-current stroke-[1.5px]",
                                  // Fill selected seats white
                                  isSelected && "fill-white text-white",
                                  // Booked seats green
                                  isBooked && "fill-green-500 text-green-500 stroke-green-500"
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
        })}
      </div>

      {/* Screen at Bottom */}
      <div className="mt-12 relative">
        <p className="text-center text-xs tracking-[0.5em] text-muted-foreground mb-4 font-mono uppercase">Screen</p>
        <div className="h-16 w-3/4 mx-auto bg-gradient-to-t from-primary/20 to-transparent transform perspective-3d -rotate-x-12 opacity-50 mask-image-gradient-reverse" />
        <div className="h-2 w-3/4 mx-auto bg-white/20 rounded-full blur-[2px] screen-glow" />
      </div>
    </div>
  );
}
