import { supabase } from '../../db/supabase';
import { ServiceUnavailableError, NotFoundError, ValidationError } from '../../middleware/errors';
import { VehicleType } from './vehicle-type.types';

export class VehicleTypeService {
  /**
   * Map database row to VehicleType interface
   * Converts snake_case fields from database to camelCase
   */
  private static mapToVehicleType(row: any): VehicleType {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      hourlyRate: row.hourly_rate,
      dailyRate: row.daily_rate,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async listActive(): Promise<VehicleType[]> {
    const { data, error } = await supabase
      .from('vehicle_types')
      .select('id, name, code, hourly_rate, daily_rate, is_active, created_at, updated_at')
      .eq('is_active', true);

    if (error) {
      throw new ServiceUnavailableError(
        'Serviço temporariamente indisponível. Tente novamente em instantes'
      );
    }

    return (data || []).map(row => this.mapToVehicleType(row));
  }

  async getById(id: string): Promise<VehicleType> {
    const { data, error } = await supabase
      .from('vehicle_types')
      .select('id, name, code, hourly_rate, daily_rate, is_active, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        throw new NotFoundError('Tipo de veículo não encontrado');
      }
      throw new ServiceUnavailableError(
        'Serviço temporariamente indisponível. Tente novamente em instantes'
      );
    }

    return this.mapToVehicleType(data);
  }

  async updateRates(
    id: string,
    hourlyRate: number,
    dailyRate: number
  ): Promise<VehicleType> {
    // Validate rates are >= 0.01
    if (hourlyRate < 0.01 || dailyRate < 0.01) {
      throw new ValidationError(
        'As tarifas devem ser maiores que 0.01'
      );
    }

    // Update the vehicle type with new rates
    const { data, error } = await supabase
      .from('vehicle_types')
      .update({
        hourly_rate: hourlyRate,
        daily_rate: dailyRate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, name, code, hourly_rate, daily_rate, is_active, created_at, updated_at')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        throw new NotFoundError('Tipo de veículo não encontrado');
      }
      throw new ServiceUnavailableError(
        'Serviço temporariamente indisponível. Tente novamente em instantes'
      );
    }

    return this.mapToVehicleType(data);
  }
}
