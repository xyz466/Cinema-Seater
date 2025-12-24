import { Armchair } from "lucide-react";

export function Legend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mt-12 py-6 px-8 rounded-full bg-secondary/30 backdrop-blur-sm border border-white/5 mx-auto w-fit">
      <div className="flex items-center gap-2">
        <Armchair className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-muted-foreground">Available</span>
      </div>
      <div className="flex items-center gap-2">
        <Armchair className="w-5 h-5 text-white fill-white" />
        <span className="text-sm text-white font-medium">Selected</span>
      </div>
      <div className="flex items-center gap-2">
        <Armchair className="w-5 h-5 text-green-500 fill-green-500" />
        <span className="text-sm text-green-500">Occupied</span>
      </div>
    </div>
  );
}
