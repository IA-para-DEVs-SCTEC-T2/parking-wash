/**
 * Wash Orders Module — Input Validation
 *
 * Zod schemas for validating wash order API requests.
 * Ensures license plates follow Brazilian formats (legacy and Mercosul)
 * and wash service IDs are valid UUIDs.
 */
import { z } from 'zod';
/**
 * Schema for creating a new wash order
 * Validates: licensePlate (required, valid format) and washServiceId (required, valid UUID)
 */
export declare const createWashOrderSchema: z.ZodObject<{
    licensePlate: z.ZodEffects<z.ZodString, string, string>;
    washServiceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    licensePlate: string;
    washServiceId: string;
}, {
    licensePlate: string;
    washServiceId: string;
}>;
/**
 * TypeScript type inferred from createWashOrderSchema
 */
export type CreateWashOrderRequest = z.infer<typeof createWashOrderSchema>;
/**
 * Schema for updating wash order status
 * Validates: status must be one of the valid WashOrderStatus values
 */
export declare const updateWashOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["Waiting", "InProgress", "Completed"]>;
}, "strip", z.ZodTypeAny, {
    status: "Waiting" | "InProgress" | "Completed";
}, {
    status: "Waiting" | "InProgress" | "Completed";
}>;
/**
 * TypeScript type inferred from updateWashOrderStatusSchema
 */
export type UpdateWashOrderStatusRequest = z.infer<typeof updateWashOrderStatusSchema>;
/**
 * Schema for listing wash orders with optional status filter
 * Validates: status (optional) must be one of the valid WashOrderStatus values
 */
export declare const listWashOrdersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["Waiting", "InProgress", "Completed"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "Waiting" | "InProgress" | "Completed" | undefined;
}, {
    status?: "Waiting" | "InProgress" | "Completed" | undefined;
}>;
/**
 * TypeScript type inferred from listWashOrdersSchema
 */
export type ListWashOrdersQuery = z.infer<typeof listWashOrdersSchema>;
//# sourceMappingURL=wash-orders.validator.d.ts.map