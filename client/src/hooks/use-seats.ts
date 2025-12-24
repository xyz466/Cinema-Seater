import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Seat, type BookSeatsRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSeats() {
  return useQuery({
    queryKey: [api.seats.list.path],
    queryFn: async () => {
      const res = await fetch(api.seats.list.path);
      if (!res.ok) throw new Error("Failed to fetch seats");
      return api.seats.list.responses[200].parse(await res.json());
    },
    // Poll every 5 seconds to keep seat map fresh in a real cinema context
    refetchInterval: 5000, 
  });
}

export function useBookSeats() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BookSeatsRequest) => {
      // Manually validate before sending to catch issues early
      const validated = api.seats.book.input.parse(data);
      
      const res = await fetch(api.seats.book.path, {
        method: api.seats.book.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 409) {
          const error = await res.json();
          throw new Error(error.message || "Seats already booked");
        }
        if (res.status === 400) {
           const error = await res.json();
           throw new Error(error.message || "Validation failed");
        }
        throw new Error("Booking failed");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.seats.list.path] });
      toast({
        title: "Booking Confirmed!",
        description: data.message,
        className: "bg-green-500/10 border-green-500 text-green-500",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useResetSeats() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.seats.reset.path, {
        method: api.seats.reset.method,
      });
      if (!res.ok) throw new Error("Failed to reset seats");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.seats.list.path] });
      toast({
        title: "System Reset",
        description: "All seats have been cleared.",
      });
    },
  });
}
