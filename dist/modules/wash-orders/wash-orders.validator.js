"use strict";
/**
 * Wash Orders Module — Input Validation
 *
 * Zod schemas for validating wash order API requests.
 * Ensures license plates follow Brazilian formats (legacy and Mercosul)
 * and wash service IDs are valid UUIDs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.listWashOrdersSchema = exports.updateWashOrderStatusSchema = exports.createWashOrderSchema = void 0;
const zod_1 = require("zod");
/**
 * Regex patterns for Brazilian license plates
 * - Legacy format: AAA-9999 (3 letters, hyphen, 4 digits)
 * - Mercosul format: AAA9A99 (3 letters, 1 digit, 1 letter, 2 digits)
 */
const LEGACY_PLATE_REGEX = /^[A-Z]{3}-\d{4}$/;
const MERCOSUL_PLATE_REGEX = /^[A-Z]{3}\d[A-Z]\d{2}$/;
/**
 * Validates a Brazilian license plate
 * Accepts both legacy (AAA-9999) and Mercosul (AAA9A99) formats
 */
const licensePlateSchema = zod_1.z
    .string()
    .min(1, 'Placa é obrigatória')
    .refine((plate) => LEGACY_PLATE_REGEX.test(plate) || MERCOSUL_PLATE_REGEX.test(plate), 'Placa inválida. Use o formato AAA-9999 ou AAA9A99');
/**
 * Validates a UUID v4 format
 */
const uuidSchema = zod_1.z
    .string()
    .uuid('ID deve ser um UUID válido');
/**
 * Schema for creating a new wash order
 * Validates: licensePlate (required, valid format) and washServiceId (required, valid UUID)
 */
exports.createWashOrderSchema = zod_1.z.object({
    licensePlate: licensePlateSchema,
    washServiceId: uuidSchema,
});
/**
 * Schema for updating wash order status
 * Validates: status must be one of the valid WashOrderStatus values
 */
exports.updateWashOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['Waiting', 'InProgress', 'Completed'], {
        errorMap: () => ({
            message: 'Status inválido. Valores aceitos: Waiting, InProgress, Completed',
        }),
    }),
});
/**
 * Schema for listing wash orders with optional status filter
 * Validates: status (optional) must be one of the valid WashOrderStatus values
 */
exports.listWashOrdersSchema = zod_1.z.object({
    status: zod_1.z
        .enum(['Waiting', 'InProgress', 'Completed'], {
        errorMap: () => ({
            message: 'Status inválido. Valores aceitos: Waiting, InProgress, Completed',
        }),
    })
        .optional(),
});
//# sourceMappingURL=wash-orders.validator.js.map