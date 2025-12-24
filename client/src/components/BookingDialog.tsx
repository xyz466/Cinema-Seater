import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type Seat } from "@shared/schema";
import { Loader2, User } from "lucide-react";
import { motion } from "framer-motion";

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSeats: Seat[];
  onConfirm: (name: string) => void;
  isPending: boolean;
}

export function BookingDialog({ isOpen, onClose, selectedSeats, onConfirm, isPending }: BookingDialogProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isPending && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-white/10 text-card-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Confirm Reservation</DialogTitle>
          <DialogDescription>
            You are booking {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} for the 8:00 PM showing.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-secondary/50 rounded-lg p-4 mb-4 border border-white/5">
          <div className="text-sm text-muted-foreground mb-2">Selected Seats:</div>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <span key={seat.id} className="bg-background border border-white/10 px-2 py-1 rounded font-mono text-xs">
                {seat.row}{seat.number}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Your Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-background border border-white/10 rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoFocus
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isPending}
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none transition-all flex items-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
