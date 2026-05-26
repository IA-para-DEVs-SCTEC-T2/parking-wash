/**
 * Validation schemas and utilities for the parking module
 * Uses Zod for runtime validation of parking-related requests
 */
import { z } from 'zod';
/**
 * Validates if a license plate string matches either Brazilian format
 * @param plate - The license plate string to validate
 * @returns true if the plate matches legacy (AAA-9999) or Mercosul (AAA9A99) format, false otherwise
 */
export declare function isValidLicensePlate(plate: string): boolean;
/**
 * Zod schema for validating check-in requests
 * Validates that licensePlate is a non-empty string matching Brazilian plate formats
 */
export declare const checkInSchema: z.ZodObject<{
    licensePlate: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    licensePlate: string;
}, {
    licensePlate: string;
}>;
/**
 * Type inference from checkInSchema for type-safe request handling
 */
export type CheckInSchemaType = z.infer<typeof checkInSchema>;
/**
 * Zod schema for validating list parking query parameters
 * Validates optional status filter parameter
 */
export declare const listParkingSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["Parked", "Exited"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "Parked" | "Exited" | undefined;
}, {
    status?: "Parked" | "Exited" | undefined;
}>;
/**
 * Type inference from listParkingSchema for type-safe query parameter handling
 */
export type ListParkingSchemaType = z.infer<typeof listParkingSchema>;
//# sourceMappingURL=parking.validator.d.ts.map