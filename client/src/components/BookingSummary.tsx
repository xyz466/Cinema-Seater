import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Ticket } from "lucide-react";
import { type Seat } from "@shared/schema";

interface BookingSummaryProps {
  selectedSeats: Seat[];
  onBook: () => void;
  isPending: boolean;
}

export function BookingSummary({ selectedSeats, onBook, isPending }: BookingSummaryProps) {
  const totalCost = selectedSeats.length * 15; // Assuming $15 per ticket

  return (
    <AnimatePresence>
      {selectedSeats.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-40"
        >
          <div className="max-w-2xl mx-auto">
            <div className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg leading-tight">
                    {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} Selected
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedSeats.map(s => `${s.row}${s.number}`).join(", ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <span className="block text-xs text-muted-foreground uppercase tracking-wider">Total</span>
                  <span className="block text-2xl font-bold font-display text-white">${totalCost}</span>
                </div>

                <button
                  onClick={onBook}
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Book Tickets"
                  )}
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
