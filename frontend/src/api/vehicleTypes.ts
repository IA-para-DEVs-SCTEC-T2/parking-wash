import { apiGet } from './client'
import { VehicleType } from '../types/washOrders'

export async function listVehicleTypes(): Promise<VehicleType[]> {
  return apiGet<VehicleType[]>('/api/vehicle-types')
}
