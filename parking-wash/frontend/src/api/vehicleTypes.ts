import { apiGet } from './client'
import type { VehicleType } from '../types/parking'

export async function getVehicleTypes(): Promise<VehicleType[]> {
  return apiGet<VehicleType[]>('/api/vehicle-types')
}
