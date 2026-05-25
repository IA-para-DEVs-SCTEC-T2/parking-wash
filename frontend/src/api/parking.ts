import { apiGet, apiPost } from './client'
import type { ParkingRecord } from '../types/parking'

export async function checkIn(licensePlate: string): Promise<ParkingRecord> {
  return apiPost<ParkingRecord>('/api/parking/checkin', { licensePlate })
}

export async function checkOut(id: string): Promise<ParkingRecord> {
  return apiPost<ParkingRecord>(`/api/parking/${id}/checkout`, {})
}

export async function listParking(status?: string): Promise<ParkingRecord[]> {
  const url = status ? `/api/parking?status=${status}` : '/api/parking'
  return apiGet<ParkingRecord[]>(url)
}
