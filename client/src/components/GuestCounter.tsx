import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuestCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export default function GuestCounter({
  value,
  onChange,
  min = 1,
  max = 20,
  label = "Number of people",
  className = "",
}: GuestCounterProps) {
  const decrement = () => {
    const newValue = Math.max(min, value - 1);
    if (newValue !== value) onChange(newValue);
  };

  const increment = () => {
    const newValue = Math.min(max, value + 1);
    if (newValue !== value) onChange(newValue);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-center border border-gray-300 rounded-md w-fit">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={decrement}
          disabled={value <= min}
          className="h-9 w-9 rounded-r-none border-r hover:bg-gray-100 disabled:opacity-50"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="min-w-[48px] text-center font-medium px-3 py-1.5 select-none">
          {value}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={increment}
          disabled={value >= max}
          className="h-9 w-9 rounded-l-none border-l hover:bg-gray-100 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
