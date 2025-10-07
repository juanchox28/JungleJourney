import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, Leaf, MapPin } from "lucide-react";

interface TourCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  priceDisplay: string;
  showPriceSubtext?: boolean;
  location?: string;
  rating: number;
  reviews: number;
  groupSize: string;
  onClick?: (id: string) => void;
}

const difficultyConfig = {
  Easy: { icon: Leaf, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  Moderate: { icon: Leaf, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  Challenging: { icon: Leaf, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" }
};

export default function TourCard({
  id,
  image,
  title,
  description,
  duration,
  difficulty,
  priceDisplay,
  showPriceSubtext = true,
  location,
  rating,
  reviews,
  groupSize,
  onClick
}: TourCardProps) {
  const DifficultyIcon = difficultyConfig[difficulty].icon;
  const isMonetary = priceDisplay.startsWith('$');

  return (
    <Card 
      data-testid={`card-tour-${id}`}
      className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer group"
      onClick={() => onClick?.(id)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <Badge className={difficultyConfig[difficulty].color}>
            <DifficultyIcon className="w-3 h-3 mr-1" />
            {difficulty}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-serif text-xl font-semibold text-card-foreground line-clamp-2">
            {title}
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground flex-wrap">
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{groupSize}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-semibold text-card-foreground">{rating}</span>
            <span className="text-sm text-muted-foreground">({reviews})</span>
          </div>
          <div className="text-right">
            <p className={`${isMonetary ? 'text-2xl' : 'text-base'} font-bold text-card-foreground`}>
              {priceDisplay}
            </p>
            {isMonetary && showPriceSubtext && <p className="text-xs text-muted-foreground">per person</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
