import { useState } from "react";
import { useSeats, useBookSeats, useResetSeats } from "@/hooks/use-seats";
import { SeatMap } from "@/components/SeatMap";
import { BookingSummary } from "@/components/BookingSummary";
import { BookingDialog } from "@/components/BookingDialog";
import { Legend } from "@/components/Legend";
import { Clapperboard, RotateCcw, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { data: seats = [], isLoading, error } = useSeats();
  const bookMutation = useBookSeats();
  const resetMutation = useResetSeats();
  const { toast } = useToast();
  
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tier, setTier] = useState<string>("Royal");
  const [count, setCount] = useState<number>(2);
  const [isFinding, setIsFinding] = useState(false);

  const selectedSeats = seats.filter(s => selectedSeatIds.includes(s.id));

  const handleToggleSeat = (seatId: number) => {
    setSelectedSeatIds(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleFindSeats = async () => {
    setIsFinding(true);
    try {
      const res = await fetch(`/api/seats/find?section=${tier}&count=${count}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "No seats found");
      }
      const foundSeats = await res.json();
      setSelectedSeatIds(foundSeats.map((s: any) => s.id));
      toast({
        title: "Seats Found!",
        description: `Selected ${foundSeats.length} seats in ${tier} tier.`,
      });
    } catch (error: any) {
      toast({
        title: "No seats found",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsFinding(false);
    }
  };

  const handleBookConfirm = async (name: string) => {
    try {
      await bookMutation.mutateAsync({
        seatIds: selectedSeatIds,
        bookedBy: name,
      });
      setIsDialogOpen(false);
      setSelectedSeatIds([]); // Clear selection on success
    } catch (e) {
      // Error handled by hook toast
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="text-muted-foreground font-display tracking-widest uppercase text-sm">Loading Cinema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Cinema</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      
      {/* Header */}
      <header className="border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Clapperboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl md:text-2xl tracking-tight">CinePlex<span className="text-primary">.io</span></h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Premium Seat Reservation</p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to reset all bookings?")) {
                resetMutation.mutate();
                setSelectedSeatIds([]);
              }
            }}
            className="text-xs font-mono text-muted-foreground hover:text-white flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            RESET DEMO
          </button>
        </div>
      </header>

      <main className="py-12 px-4 pb-40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="text-center mb-12 space-y-2">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
              >
                Interstellar
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-sm md:text-base"
              >
                Today • 8:00 PM • Hall 4 • IMAX Laser
              </motion.p>
            </div>

            <SeatMap 
              seats={seats} 
              selectedSeatIds={selectedSeatIds} 
              onToggleSeat={handleToggleSeat} 
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-white/10 bg-card/30 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Status
                </CardTitle>
                <Legend />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Tier</Label>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger className="bg-background/50 border-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Royal">Royal (Back)</SelectItem>
                      <SelectItem value="Prime Plus">Prime Plus</SelectItem>
                      <SelectItem value="Prime">Prime</SelectItem>
                      <SelectItem value="Classic">Classic (Front)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Seats</Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="number" 
                      min={1} 
                      max={10} 
                      value={count} 
                      onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                      className="bg-background/50 border-white/5"
                    />
                    <Button 
                      className="flex-1" 
                      onClick={handleFindSeats}
                      disabled={isFinding}
                    >
                      {isFinding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Find Best
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BookingSummary 
        selectedSeats={selectedSeats}
        onBook={() => setIsDialogOpen(true)}
        isPending={bookMutation.isPending}
      />

      <BookingDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedSeats={selectedSeats}
        onConfirm={handleBookConfirm}
        isPending={bookMutation.isPending}
      />
    </div>
  );
}
