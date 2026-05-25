"use strict";
/**
 * Validation schemas and utilities for the parking module
 * Uses Zod for runtime validation of parking-related requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.listParkingSchema = exports.checkInSchema = void 0;
exports.isValidLicensePlate = isValidLicensePlate;
const zod_1 = require("zod");
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
function isValidLicensePlate(plate) {
    return LEGACY_PLATE_REGEX.test(plate) || MERCOSUL_PLATE_REGEX.test(plate);
}
/**
 * Zod schema for validating check-in requests
 * Validates that licensePlate is a non-empty string matching Brazilian plate formats
 */
exports.checkInSchema = zod_1.z.object({
    licensePlate: zod_1.z
        .string()
        .min(1, 'Placa é obrigatória')
        .refine((plate) => isValidLicensePlate(plate), 'Placa inválida. Use o formato AAA-9999 ou AAA9A99'),
});
/**
 * Zod schema for validating list parking query parameters
 * Validates optional status filter parameter
 */
exports.listParkingSchema = zod_1.z.object({
    status: zod_1.z
        .enum(['Parked', 'Exited'])
        .optional()
        .describe('Filter parking records by status'),
});
//# sourceMappingURL=parking.validator.js.map