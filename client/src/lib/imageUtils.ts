import jaguarImage from '@assets/generated_images/Amazon_jaguar_wildlife_encounter_30857d91.png';
import dolphinImage from '@assets/generated_images/Pink_dolphins_Amazon_sunset_d0aee95e.png';
import canoeImage from '@assets/generated_images/Canoe_Amazon_river_dawn_94feb359.png';
import type { Tour } from "@shared/schema";

export const fallbackImages = [jaguarImage, dolphinImage, canoeImage];

/**
 * Derives a stable index from a tour id for deterministic fallback selection.
 */
export function getStableIndex(tour: Tour, fallbackIndex = 0): number {
  return tour.id
    ? parseInt(tour.id.replace(/\D/g, '').slice(-1) || '0', 10)
    : fallbackIndex;
}

/**
 * Returns the best available image for a tour:
 * - If the tour has an external image URL, uses it
 * - Otherwise falls back to a local generated image selected by stable index
 */
export function getImageForTour(tour: Tour, fallbackIndex = 0): string {
  const stableIndex = getStableIndex(tour, fallbackIndex);
  const getFallback = () => fallbackImages[stableIndex % fallbackImages.length];

  if (tour.images && tour.images.trim() !== '') {
    const img = tour.images.trim();

    // JSON array string like '["img1.jpg", "img2.jpg"]'
    if (img.startsWith('[')) {
      try {
        const parsed = JSON.parse(img);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = String(parsed[0]);
          return first.startsWith('http') ? first : getFallback();
        }
      } catch {
        // fall through to treat as plain string
      }
    }

    // Plain string — external URL or fallback
    if (img.startsWith('http')) {
      return img;
    }
  }

  return getFallback();
}

/**
 * React event handler for <img> onError.
 * Replaces a broken image with a random fallback from the local generated set.
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  if (!img.dataset.fallback) {
    img.dataset.fallback = 'true';
    const idx = Math.floor(Math.random() * fallbackImages.length);
    img.src = fallbackImages[idx];
  }
}
