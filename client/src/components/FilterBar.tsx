import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Leaf, DollarSign, Bird, Waves, Trees } from "lucide-react";
import { useState } from "react";

interface FilterOption {
  id: string;
  label: string;
  icon: React.ElementType;
  category: "duration" | "difficulty" | "price" | "type";
}

const filterOptions: FilterOption[] = [
  { id: "1-3days", label: "1-3 days", icon: Clock, category: "duration" },
  { id: "4-7days", label: "4-7 days", icon: Clock, category: "duration" },
  { id: "8plus", label: "8+ days", icon: Clock, category: "duration" },
  { id: "easy", label: "Easy", icon: Leaf, category: "difficulty" },
  { id: "moderate", label: "Moderate", icon: Leaf, category: "difficulty" },
  { id: "challenging", label: "Challenging", icon: Leaf, category: "difficulty" },
  { id: "budget", label: "Under $500", icon: DollarSign, category: "price" },
  { id: "mid", label: "$500-$1000", icon: DollarSign, category: "price" },
  { id: "luxury", label: "$1000+", icon: DollarSign, category: "price" },
  { id: "wildlife", label: "Wildlife", icon: Bird, category: "type" },
  { id: "river", label: "River Tours", icon: Waves, category: "type" },
  { id: "canopy", label: "Canopy", icon: Trees, category: "type" },
];

interface FilterBarProps {
  onFilterChange?: (filters: string[]) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleFilter = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter(id => id !== filterId)
      : [...selectedFilters, filterId];
    
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
    console.log('Filters changed:', newFilters);
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    onFilterChange?.([]);
    console.log('Filters cleared');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filter Tours</h3>
        {selectedFilters.length > 0 && (
          <Button 
            data-testid="button-clear-filters"
            variant="ghost" 
            size="sm"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedFilters.includes(option.id);
          
          return (
            <Badge
              key={option.id}
              data-testid={`filter-${option.id}`}
              onClick={() => toggleFilter(option.id)}
              className={`
                cursor-pointer whitespace-nowrap gap-1.5 px-4 py-2 text-sm
                ${isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {option.label}
            </Badge>
          );
        })}
      </div>

      {selectedFilters.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedFilters.length} filter{selectedFilters.length !== 1 ? 's' : ''} active
        </p>
      )}
    </div>
  );
}
