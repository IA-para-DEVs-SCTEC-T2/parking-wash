/**
 * FIPE Service
 * Integrates with FIPE API to retrieve vehicle information by license plate
 * Now uses SINESP as primary source with FIPE as fallback
 * Provides fallback data if both APIs are unavailable
 */

import { FipeVehicleData, FipeApiResponse, FipeCacheEntry } from './fipe.types';
import { getVehicleDataFromSinesp } from './sinesp.service';

/**
 * In-memory cache for FIPE data
 * Stores vehicle information to avoid repeated API calls
 * Cache expires after 24 hours
 */
const fipeCache: Map<string, FipeCacheEntry> = new Map();

/**
 * Fallback vehicle data when both SINESP and FIPE APIs are unavailable
 * Used to ensure application continues working even if external APIs fail
 */
const FALLBACK_VEHICLE_DATA: Record<string, FipeVehicleData> = {
  default: {
    brand: 'Desconhecido',
    model: 'Modelo Desconhecido',
    year: new Date().getFullYear(),
    fuel: 'Gasolina',
    fipeValue: 0,
    vehicleType: 'Carro',
    retrievedAt: new Date().toISOString(),
  },
};

/**
 * Normalize license plate format
 * Converts to uppercase and removes hyphens
 * Supports both old format (AAA-9999) and Mercosul format (AAA9A99)
 */
function normalizeLicensePlate(plate: string): string {
  return plate.toUpperCase().replace(/-/g, '');
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: FipeCacheEntry): boolean {
  const now = new Date();
  const expiresAt = new Date(entry.expiresAt);
  return now < expiresAt;
}

/**
 * Get vehicle data from FIPE API
 * Attempts to fetch real data from FIPE API
 * Falls back to default data if API is unavailable
 *
 * @param licensePlate - Vehicle license plate (AAA-9999 or AAA9A99 format)
 * @returns Vehicle data from FIPE or fallback data
 */
export async function getVehicleDataFromFipe(
  licensePlate: string
): Promise<FipeVehicleData> {
  try {
    const normalizedPlate = normalizeLicensePlate(licensePlate);

    // Check cache first
    const cached = fipeCache.get(normalizedPlate);
    if (cached && isCacheValid(cached)) {
      console.log(`[FIPE] Cache hit for plate: ${licensePlate}`);
      return cached.data;
    }

    // Try SINESP first (primary source)
    try {
      console.log(`[FIPE] Attempting SINESP lookup for plate: ${licensePlate}`);
      const vehicleData = await getVehicleDataFromSinesp(licensePlate);
      
      // Cache the result
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      fipeCache.set(normalizedPlate, {
        licensePlate: normalizedPlate,
        data: vehicleData,
        cachedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      });

      console.log(`[FIPE] Successfully retrieved data from SINESP for plate: ${licensePlate}`);
      return vehicleData;
    } catch (sinespError) {
      console.warn(`[FIPE] SINESP lookup failed, trying FIPE fallback:`, sinespError);
      
      // Try to fetch from FIPE API as fallback
      const vehicleData = await fetchFromFipeApi(normalizedPlate);

      // Cache the result
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      fipeCache.set(normalizedPlate, {
        licensePlate: normalizedPlate,
        data: vehicleData,
        cachedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      });

      console.log(`[FIPE] Successfully retrieved data from FIPE for plate: ${licensePlate}`);
      return vehicleData;
    }
  } catch (error) {
    console.error(`[FIPE] Error fetching vehicle data for plate ${licensePlate}:`, error);
    // Return fallback data to ensure application continues working
    return FALLBACK_VEHICLE_DATA.default;
  }
}

/**
 * Fetch vehicle data from FIPE API
 * This is a placeholder implementation
 * In production, integrate with actual FIPE API or use a library like:
 * - fipe-api-client
 * - axios with FIPE endpoint
 * - fetch API with FIPE endpoint
 *
 * @param normalizedPlate - Normalized license plate (without hyphens)
 * @returns Vehicle data from FIPE API
 */
async function fetchFromFipeApi(normalizedPlate: string): Promise<FipeVehicleData> {
  // Placeholder: In production, this would call the actual FIPE API
  // Example using a hypothetical FIPE API client:
  /*
  const fipeClient = new FipeClient({
    apiKey: process.env.FIPE_API_KEY,
  });

  const response = await fipeClient.getVehicleByPlate(normalizedPlate);
  return {
    brand: response.brand,
    model: response.model,
    year: response.year,
    fuel: response.fuel,
    fipeValue: response.value,
    vehicleType: response.type,
    retrievedAt: new Date().toISOString(),
  };
  */

  // For now, return fallback data
  // This ensures the application works without external API dependency
  return FALLBACK_VEHICLE_DATA.default;
}

/**
 * Get vehicle data with fallback
 * Attempts to get real FIPE data, falls back to default if unavailable
 *
 * @param licensePlate - Vehicle license plate
 * @returns Vehicle data (real or fallback)
 */
export async function getVehicleData(licensePlate: string): Promise<FipeVehicleData> {
  return getVehicleDataFromFipe(licensePlate);
}

/**
 * Clear FIPE cache
 * Useful for testing or forcing refresh of all cached data
 */
export function clearFipeCache(): void {
  fipeCache.clear();
  console.log('[FIPE] Cache cleared');
}

/**
 * Get cache statistics
 * Returns information about cached entries
 */
export function getFipeCacheStats(): {
  totalEntries: number;
  entries: Array<{ plate: string; cachedAt: string; expiresAt: string }>;
} {
  const entries = Array.from(fipeCache.values()).map((entry) => ({
    plate: entry.licensePlate,
    cachedAt: entry.cachedAt,
    expiresAt: entry.expiresAt,
  }));

  return {
    totalEntries: fipeCache.size,
    entries,
  };
}
