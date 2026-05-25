/**
 * Type definitions for the parking module
 * Defines all interfaces and types used in parking check-in/check-out operations
 */
/**
 * Status of a parking record
 * - 'Parked': Vehicle is currently in the parking lot
 * - 'Exited': Vehicle has left the parking lot
 */
export type ParkingStatus = 'Parked' | 'Exited';
/**
 * Complete parking record stored in the database
 * Represents a vehicle's entry and exit from the parking lot
 */
export interface ParkingRecord {
    /** Unique identifier (UUID) */
    id: string;
    /** Vehicle license plate in Brazilian format (legacy: AAA-9999 or Mercosul: AAA9A99) */
    license_plate: string;
    /** ISO 8601 UTC timestamp of vehicle entry */
    entry_time: string;
    /** ISO 8601 UTC timestamp of vehicle exit, or null if still parked */
    exit_time: string | null;
    /** Duration of parking in minutes, or null if still parked */
    duration_minutes: number | null;
    /** Total amount charged in Brazilian Real, or null if still parked */
    total_amount: number | null;
    /** Current status of the parking record */
    status: ParkingStatus;
}
/**
 * Request payload for check-in operation
 * Sent by the client to register a vehicle entry
 */
export interface CheckInRequest {
    /** Vehicle license plate in Brazilian format */
    licensePlate: string;
}
/**
 * Response payload for successful check-in operation
 * Returned to the client after vehicle entry is registered
 */
export interface CheckInResponse {
    /** Unique identifier of the parking record */
    id: string;
    /** Vehicle license plate */
    licensePlate: string;
    /** ISO 8601 UTC timestamp of vehicle entry */
    entryTime: string;
    /** Current status (always 'Parked' for check-in response) */
    status: ParkingStatus;
}
/**
 * Response payload for successful check-out operation
 * Extends ParkingRecord with guaranteed total_amount (non-null after checkout)
 * Returned to the client after vehicle exit and tariff calculation
 */
export interface CheckOutResponse extends ParkingRecord {
    /** Total amount is guaranteed to be a number after checkout */
    total_amount: number;
}
//# sourceMappingURL=parking.types.d.ts.map