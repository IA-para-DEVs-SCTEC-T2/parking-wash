/**
 * Validation schemas and utilities for the parking module
 * Uses Zod for runtime validation of parking-related requests
 */

import { z } from 'zod';

/**
 * Regex pattern for legacy Brazilian license plate format
 * Format: AAA-9999 (3 uppercase letters, hyphen, 4 digits)
 * Example: ABC-1234
 */
const LEGACY_PLATE_REGEX = /^[A-Z]{3}-\d{4}$/;

/**
 * Regex pattern for Mercosul Brazilian license plate format
 * Format: AAA9A99 (3 uppercase letters, 1 digit, 1 uppercase letter, 2 digits)
 * Example: ABC1D23
 */
const MERCOSUL_PLATE_REGEX = /^[A-Z]{3}\d[A-Z]\d{2}$/;

/**
 * Validates if a license plate string matches either Brazilian format
 * @param plate - The license plate string to validate
 * @returns true if the plate matches legacy (AAA-9999) or Mercosul (AAA9A99) format, false otherwise
 */
export function isValidLicensePlate(plate: string): boolean {
  return LEGACY_PLATE_REGEX.test(plate) || MERCOSUL_PLATE_REGEX.test(plate);
}

/**
 * Zod schema for validating check-in requests
 * Validates that licensePlate is a non-empty string matching Brazilian plate formats
 */
export const checkInSchema = z.object({
  licensePlate: z
    .string()
    .min(1, 'Placa é obrigatória')
    .refine(
      (plate) => isValidLicensePlate(plate),
      'Placa inválida. Use o formato AAA-9999 ou AAA9A99'
    ),
});

/**
 * Type inference from checkInSchema for type-safe request handling
 */
export type CheckInSchemaType = z.infer<typeof checkInSchema>;

/**
 * Zod schema for validating list parking query parameters
 * Validates optional status filter parameter
 */
export const listParkingSchema = z.object({
  status: z
    .enum(['Parked', 'Exited'])
    .optional()
    .describe('Filter parking records by status'),
});

/**
 * Type inference from listParkingSchema for type-safe query parameter handling
 */
export type ListParkingSchemaType = z.infer<typeof listParkingSchema>;
