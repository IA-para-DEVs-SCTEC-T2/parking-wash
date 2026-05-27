/**
 * Service layer for parking operations
 * Handles check-in, check-out, fee calculation, and record listing
 */

import { supabase } from '../../db/supabase';
import { config } from '../../config/env';
import {
  ParkingRecord,
  CheckInResponse,
  CheckOutResponse,
} from './parking.types';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  ServiceUnavailableError,
} from '../../middleware/errors';

export class ParkingService {
  /**
   * Register a vehicle entry into the parking lot
   * @param licensePlate - Vehicle license plate in Brazilian format
   * @returns CheckInResponse with parking record details
   * @throws ConflictError if vehicle is already parked
   * @throws ServiceUnavailableError if database operation fails
   */
  async checkIn(licensePlate: string): Promise<CheckInResponse> {
    try {
      // Check if vehicle is already parked
      const { data: existingRecord, error: selectError } = await supabase
        .from('parking_records')
        .select('*')
        .eq('license_plate', licensePlate)
        .eq('status', 'Parked')
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        // PGRST116 = no rows found (expected case)
        throw new ServiceUnavailableError(
          'Serviço temporariamente indisponível. Tente novamente em instantes'
        );
      }

      if (existingRecord) {
        throw new ConflictError(
          `Veículo com placa ${licensePlate} já está estacionado`
        );
      }

      // Insert new parking record
      const now = new Date().toISOString();
      const { data: newRecord, error: insertError } = await supabase
        .from('parking_records')
        .insert({
          license_plate: licensePlate,
          entry_time: now,
          status: 'Parked',
        })
        .select()
        .single();

      if (insertError) {
        throw new ServiceUnavailableError(
          'Serviço temporariamente indisponível. Tente novamente em instantes'
        );
      }

      return {
        id: newRecord.id,
        licensePlate: newRecord.license_plate,
        entryTime: newRecord.entry_time,
        status: newRecord.status,
      };
    } catch (error) {
      if (error instanceof ConflictError || error instanceof ServiceUnavailableError) {
        throw error;
      }
      throw new ServiceUnavailableError(
        'Serviço temporariamente indisponível. Tente novamente em instantes'
      );
    }
  }

  /**
   * Register a vehicle exit from the parking lot and calculate parking fee
   * @param id - Parking record ID
   * @returns CheckOutResponse with parking details and calculated fee
   * @throws NotFoundError if parking record not found
   * @throws ValidationError if vehicle already checked out
   * @throws ServiceUnavailableError if database operation fails
   */
  async checkOut(id: string): Promise<CheckOutResponse> {
    try {
      // Query for the parking record
      const { data: record, error: selectError } = await supabase
        .from('parking_records')
        .select('*')
        .eq('id', id)
        .single();

      if (selectError) {
        if (selectError.code === 'PGRST116') {
          throw new NotFoundError('Registro de estacionamento não encontrado');
        }
        throw new ServiceUnavailableError(
          'Serviço temporariamente indisponível. Tente novamente em instantes'
        );
      }

      // Check if already exited
      if (record.status !== 'Parked') {
        throw new ValidationError('Este veículo já realizou checkout');
      }

      // Calculate exit time and duration
      const exitTime = new Date();
      const entryTime = new Date(record.entry_time);
      const durationMs = exitTime.getTime() - entryTime.getTime();
      const durationMinutes = Math.max(1, Math.floor(durationMs / 60000));
      const hours = Math.ceil(durationMinutes / 60);
      const fee = hours * config.hourlyRate;
      const totalAmount = Math.min(fee, config.dailyRateCap);

      // Update record with exit information
      const { data: updatedRecord, error: updateError } = await supabase
        .from('parking_records')
        .update({
          status: 'Exited',
          exit_time: exitTime.toISOString(),
          duration_minutes: durationMinutes,
          total_amount: parseFloat(totalAmount.toFixed(2)),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new ServiceUnavailableError(
          'Serviço temporariamente indisponível. Tente novamente em instantes'
        );
      }

      return {
        id: updatedRecord.id,
        licensePlate: updatedRecord.license_plate,
        entryTime: updatedRecord.entry_time,
        exitTime: updatedRecord.exit_time,
        durationMinutes: updatedRecord.duration_minutes,
        totalAmount: updatedRecord.total_amount,
        status: updatedRecord.status,
      };
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof ServiceUnavailableError
      ) {
        throw error;
      }
      throw new ServiceUnavailableError(
        'Serviço temporariamente indisponível. Tente novamente em instantes'
      );
    }
  }

  /**
   * Calculate parking fee for a given duration
   * Pure function with no I/O operations
   * @param durationMinutes - Duration of parking in minutes
   * @returns Calculated fee in Brazilian Real
   */
  calculateFee(durationMinutes: number): number {
    const hours = Math.ceil(durationMinutes / 60);
    const fee = hours * config.hourlyRate;
    return Math.min(fee, config.dailyRateCap);
  }

  /**
   * List parking records with optional status filter
   * @param status - Optional filter by status ('Parked' or 'Exited')
   * @returns Array of parking records ordered by entry_time DESC, limited to 1000
   * @throws ValidationError if status parameter is invalid
   * @throws ServiceUnavailableError if database operation fails
   */
  async listRecords(status?: string): Promise<ParkingRecord[]> {
    try {
      // Validate status parameter if provided
      if (status && !['Parked', 'Exited'].includes(status)) {
        throw new ValidationError(
          'Status inválido. Valores aceitos: Parked, Exited'
        );
      }

      let query = supabase
        .from('parking_records')
        .select('*')
        .order('entry_time', { ascending: false })
        .limit(1000);

      // Apply status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      const { data: records, error } = await query;

      if (error) {
        throw new ServiceUnavailableError(
          'Serviço temporariamente indisponível. Tente novamente em instantes'
        );
      }

      // Transform snake_case to camelCase
      return records.map(record => ({
        id: record.id,
        licensePlate: record.license_plate,
        entryTime: record.entry_time,
        exitTime: record.exit_time,
        durationMinutes: record.duration_minutes,
        totalAmount: record.total_amount,
        status: record.status,
      })) as ParkingRecord[];
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ServiceUnavailableError) {
        throw error;
      }
      throw new ServiceUnavailableError(
        'Serviço temporariamente indisponível. Tente novamente em instantes'
      );
    }
  }
}
