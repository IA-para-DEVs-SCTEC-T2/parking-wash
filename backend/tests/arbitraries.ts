/**
 * Reusable fast-check arbitraries (generators) for property-based testing
 * These generators are used across multiple test suites to generate random inputs
 * that follow specific patterns and constraints.
 *
 * Validates: Requirements 12.1, 12.2
 */

import * as fc from 'fast-check';

/**
 * Generator for legacy Brazilian license plate format (AAA-9999)
 * Example: ABC-1234, XYZ-9999
 *
 * Pattern: 3 uppercase letters, hyphen, 4 digits
 */
export const legacyPlateArb = fc
  .tuple(
    fc.stringMatching(/^[A-Z]{3}$/),
    fc.stringMatching(/^\d{4}$/)
  )
  .map(([letters, digits]) => `${letters}-${digits}`);

/**
 * Generator for Mercosul Brazilian license plate format (AAA9A99)
 * Example: ABC1D23, XYZ9K87
 *
 * Pattern: 3 uppercase letters, 1 digit, 1 uppercase letter, 2 digits
 */
export const mercosulPlateArb = fc.stringMatching(/^[A-Z]{3}\d[A-Z]\d{2}$/);

/**
 * Generator for valid license plates (either legacy or Mercosul format)
 * Combines both legacyPlateArb and mercosulPlateArb
 */
export const validPlateArb = fc.oneof(legacyPlateArb, mercosulPlateArb);

/**
 * Generator for invalid license plates
 * Generates strings that do NOT match either valid format
 * Includes: empty strings, wrong lengths, invalid characters, partial matches, etc.
 */
export const invalidPlateArb = fc
  .string()
  .filter(
    (s) =>
      !/^[A-Z]{3}-\d{4}$/.test(s) && !/^[A-Z]{3}\d[A-Z]\d{2}$/.test(s)
  );

/**
 * Generator for parking duration in minutes
 * Range: 1 to 1440 minutes (1 minute to 24 hours)
 * Minimum 1 minute ensures we always charge at least 1 hour
 */
export const durationMinutesArb = fc.integer({ min: 1, max: 1440 });

/**
 * Generator for timestamp pairs (entry_time, exit_time)
 * Ensures exit_time >= entry_time
 * Useful for testing fee calculations with realistic time ranges
 *
 * Returns object with:
 * - entryTime: Date object for vehicle entry
 * - exitTime: Date object for vehicle exit (after entry)
 */
export const timestampPairArb = fc
  .tuple(
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
    fc.integer({ min: 0, max: 1440 }) // minutes of parking duration
  )
  .map(([entry, minutes]) => ({
    entryTime: entry,
    exitTime: new Date(entry.getTime() + minutes * 60_000),
  }));

/**
 * Generator for hourly parking rate
 * Range: 0.01 to 100.00 (realistic parking rates in Brazilian currency)
 * Minimum 0.01 ensures positive rates
 */
export const hourlyRateArb = fc.float({
  min: 0.01,
  max: 100.0,
  noNaN: true,
  noInfinity: true,
});

/**
 * Generator for daily rate cap (maximum daily charge)
 * Range: 1.00 to 500.00 (realistic daily caps)
 * Minimum 1.00 ensures positive cap
 * Should typically be >= hourlyRate * 8 for realistic scenarios
 */
export const dailyRateCapArb = fc.float({
  min: 1.0,
  max: 500.0,
  noNaN: true,
  noInfinity: true,
});

/**
 * Generator for parking records
 * Combines valid plates with duration to create realistic parking scenarios
 */
export const parkingRecordArb = fc
  .tuple(validPlateArb, durationMinutesArb)
  .map(([plate, duration]) => ({
    id: fc.sample(fc.uuid(), 1)[0],
    license_plate: plate,
    entry_time: new Date(Date.now() - duration * 60000).toISOString(),
    exit_time: null,
    duration_minutes: null,
    total_amount: null,
    status: 'Parked' as const,
  }));

/**
 * Generator for wash order status values
 * Valid statuses: Waiting, InProgress, Completed
 */
export const washOrderStatusArb = fc.constantFrom(
  'Waiting',
  'InProgress',
  'Completed'
);

/**
 * Generator for UUID identifiers
 * Used for IDs of parking records, wash orders, and wash services
 */
export const uuidArb = fc.uuid();

/**
 * Generator for positive numeric values with 2 decimal places
 * Useful for prices and monetary amounts
 * Range: 0.01 to 9999.99
 */
export const priceArb = fc.float({
  min: 0.01,
  max: 9999.99,
  noNaN: true,
  noInfinity: true,
});

/**
 * Generator for non-negative integer durations (in minutes)
 * Range: 0 to 1440 minutes (0 to 24 hours)
 * Includes 0 for edge case testing
 */
export const durationEstimateArb = fc.integer({ min: 0, max: 1440 });

/**
 * Generator for service names
 * Generates realistic wash service names
 */
export const serviceNameArb = fc.constantFrom(
  'Lavagem Simples',
  'Lavagem Completa',
  'Polimento',
  'Enceramento',
  'Limpeza Interna',
  'Higienização',
  'Proteção Cerâmica'
);
