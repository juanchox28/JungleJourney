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

export const formatDuration = (duration: string | null | undefined): string => {
  if (!duration || duration.trim() === '') {
    return 'Duración variable';
  }

  // Handle decimal hours (e.g., "0,2" = 0.2 hours)
  const numericDuration = parseFloat(duration.replace(',', '.'));

  if (isNaN(numericDuration)) {
    return 'Duración variable';
  }

  if (numericDuration >= 24) {
    // Convert to days
    const days = Math.floor(numericDuration / 24);
    const remainingHours = numericDuration % 24;
    if (remainingHours === 0) {
      return `${days} día${days !== 1 ? 's' : ''}`;
    } else {
      return `${days} día${days !== 1 ? 's' : ''} ${remainingHours} hr${remainingHours !== 1 ? 's' : ''}`;
    }
  } else if (numericDuration >= 1) {
    // Full hours
    const hours = Math.floor(numericDuration);
    const minutes = Math.round((numericDuration - hours) * 60);
    if (minutes === 0) {
      return `${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min`;
    }
  } else {
    // Less than 1 hour - convert to minutes
    const minutes = Math.round(numericDuration * 60);
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }
};

export const getPriceDisplay = (tour: Tour): { value: number; text: string } => {
  const basePrice = parsePrice(tour.basePrice);
  const price2 = parsePrice(tour.price2);
  const finalPrice = basePrice || price2;

  return {
    value: finalPrice,
    text: finalPrice > 0 ? `$${finalPrice.toLocaleString('es-CO')} COP` : 'Contactar para precio'
  };
};
