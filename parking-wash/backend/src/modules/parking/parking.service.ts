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
  CheckInRequest,
  CheckOutRequest,
} from './parking.types';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  ServiceUnavailableError,
} from '../../middleware/errors';
import { PricingService } from './services/pricing.service';
import { VehicleTypeService } from '../vehicle-types/vehicle-type.service';
import { getVehicleData } from './services/fipe.service';

export class ParkingService {
  private vehicleTypeService = new VehicleTypeService();

  /**
   * Register a vehicle entry into the parking lot
   * @param request - CheckInRequest with licensePlate and optional vehicleTypeId
   * @returns CheckInResponse with parking record details
   * @throws ConflictError if vehicle is already parked
   * @throws ValidationError if vehicleTypeId is invalid
   * @throws ServiceUnavailableError if database operation fails
   */
  async checkIn(request: CheckInRequest | string): Promise<CheckInResponse> {
    try {
      // Handle backward compatibility: if string is passed, treat as licensePlate
      const licensePlate = typeof request === 'string' ? request : request.licensePlate;
      const vehicleTypeId = typeof request === 'string' ? undefined : request.vehicleTypeId;

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

      // Validate vehicleTypeId if provided
      if (vehicleTypeId) {
        try {
          await this.vehicleTypeService.getById(vehicleTypeId);
        } catch (error) {
          if (error instanceof NotFoundError) {
            throw new ValidationError('Tipo de veículo não encontrado');
          }
          throw error;
        }
      }

      // Insert new parking record
      const now = new Date().toISOString();
      const { data: newRecord, error: insertError } = await supabase
        .from('parking_records')
        .insert({
          license_plate: licensePlate,
          entry_time: now,
          status: 'Parked',
          vehicle_type_id: vehicleTypeId || null,
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
        vehicleInfo: await getVehicleData(licensePlate).catch(() => undefined),
      };
    } catch (error) {
      if (
        error instanceof ConflictError ||
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
   * Register a vehicle exit from the parking lot and calculate parking fee
   * @param id - Parking record ID
   * @param request - Optional CheckOutRequest with tariff options
   * @returns CheckOutResponse with parking details and calculated fee
   * @throws NotFoundError if parking record not found
   * @throws ValidationError if vehicle already checked out
   * @throws ServiceUnavailableError if database operation fails
   */
  async checkOut(id: string, request?: CheckOutRequest): Promise<CheckOutResponse> {
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

      // Calculate fee using rule-based pricing
      let totalAmount: number;
      let appliedDailyRate = false;

      if (record.vehicle_type_id) {
        // Use vehicle type pricing if available
        try {
          const vehicleType = await this.vehicleTypeService.getById(record.vehicle_type_id);
          const breakdown = PricingService.calculateFee(
            entryTime,
            exitTime,
            vehicleType.hourlyRate,
            vehicleType.dailyRate
          );
          totalAmount = breakdown.totalAmount;
          appliedDailyRate = breakdown.dailyCharge > 0;
        } catch (error) {
          // Fallback to config rates if vehicle type not found
          const breakdown = PricingService.calculateFee(
            entryTime,
            exitTime,
            config.hourlyRate,
            config.dailyRateCap
          );
          totalAmount = breakdown.totalAmount;
          appliedDailyRate = breakdown.dailyCharge > 0;
        }
      } else {
        // Use config rates
        const breakdown = PricingService.calculateFee(
          entryTime,
          exitTime,
          config.hourlyRate,
          config.dailyRateCap
        );
        totalAmount = breakdown.totalAmount;
        appliedDailyRate = breakdown.dailyCharge > 0;
      }

      // Update record with exit information
      const { data: updatedRecord, error: updateError } = await supabase
        .from('parking_records')
        .update({
          status: 'Exited',
          exit_time: exitTime.toISOString(),
          duration_minutes: durationMinutes,
          total_amount: parseFloat(totalAmount.toFixed(2)),
          applied_daily_rate: appliedDailyRate,
          payment_status: request?.paymentMethodId ? 'Pending' : 'Pending',
          payment_method_id: request?.paymentMethodId || null,
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
        appliedDailyRate: updatedRecord.applied_daily_rate,
        paymentStatus: updatedRecord.payment_status,
        vehicleInfo: await getVehicleData(updatedRecord.license_plate).catch(() => undefined),
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
   * Get parking history (last 10 exited records)
   * @returns Array of parking records with status = 'Exited', limited to 10
   * @throws ServiceUnavailableError if database operation fails
   */
  async getHistory(): Promise<ParkingRecord[]> {
    try {
      const { data: records, error } = await supabase
        .from('parking_records')
        .select('*')
        .eq('status', 'Exited')
        .order('exit_time', { ascending: false })
        .limit(10);

      if (error) {
        throw new ServiceUnavailableError(
          'Serviço temporariamente indisponível. Tente novamente em instantes'
        );
      }

      // Transform snake_case to camelCase
      return (records || []).map(record => ({
        id: record.id,
        licensePlate: record.license_plate,
        entryTime: record.entry_time,
        exitTime: record.exit_time,
        durationMinutes: record.duration_minutes,
        totalAmount: record.total_amount,
        status: record.status,
        vehicleTypeId: record.vehicle_type_id,
        appliedDailyRate: record.applied_daily_rate,
        paymentStatus: record.payment_status,
        paymentMethodId: record.payment_method_id,
        paymentTransactionId: record.payment_transaction_id,
      })) as ParkingRecord[];
    } catch (error) {
      if (error instanceof ServiceUnavailableError) {
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
      return (records || []).map(record => ({
        id: record.id,
        licensePlate: record.license_plate,
        entryTime: record.entry_time,
        exitTime: record.exit_time,
        durationMinutes: record.duration_minutes,
        totalAmount: record.total_amount,
        status: record.status,
        vehicleTypeId: record.vehicle_type_id,
        appliedDailyRate: record.applied_daily_rate,
        paymentStatus: record.payment_status,
        paymentMethodId: record.payment_method_id,
        paymentTransactionId: record.payment_transaction_id,
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
