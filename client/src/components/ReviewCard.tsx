import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface ReviewCardProps {
  author: string;
  rating: number;
  date: string;
  comment: string;
  tourName: string;
}

export default function ReviewCard({ author, rating, date, comment, tourName }: ReviewCardProps) {
  const initials = author.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card data-testid={`review-${author.toLowerCase().replace(/\s/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold">{author}</h4>
                <p className="text-sm text-muted-foreground">{date}</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2 italic">{tourName}</p>
            <p className="text-sm leading-relaxed">{comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
