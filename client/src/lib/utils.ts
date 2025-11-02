import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getApiUrl = (path: string) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  return `${apiUrl}${path}`;
};

// Static data loading for production (when API is not available)
export const loadStaticData = async <T>(filename: string): Promise<T[]> => {
  try {
    const response = await fetch(`/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading static data from ${filename}:`, error);
    return [];
  }
};
