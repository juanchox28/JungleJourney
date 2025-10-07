import type { Tour } from "@shared/schema";

export const parsePrice = (priceStr: string | null | undefined): number => {
  if (!priceStr || priceStr.trim() === '') return 0;
  const parsed = parseInt(priceStr);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatLocation = (location: string | null | undefined, includeCountry: boolean = false): string => {
  const locationMap: Record<string, string> = {
    'leticia': 'Leticia, Colombia',
    'puerto-narino': 'Puerto Nariño, Colombia',
    'mocagua': 'Mocagua, Colombia'
  };

  if (!location || location.trim() === '') {
    return 'Amazon Region';
  }

  const mapped = locationMap[location] || 'Amazon Region';
  
  if (!includeCountry && mapped !== 'Amazon Region') {
    return mapped.split(',')[0];
  }

  return mapped;
};

export const getPriceDisplay = (tour: Tour): { value: number; text: string } => {
  const basePrice = parsePrice(tour.basePrice);
  const price2 = parsePrice(tour.price2);
  const finalPrice = basePrice || price2;
  
  return {
    value: finalPrice,
    text: finalPrice > 0 ? `$${finalPrice.toLocaleString()}` : 'Contact for pricing'
  };
};
