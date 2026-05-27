import { apiGet, apiPost, apiPatch } from './client'
import {
  WashOrder,
  WashOrderStatus,
  CreateWashOrderRequest,
  UpdateWashOrderStatusRequest,
} from '../types/washOrders'

export async function createWashOrder(
  licensePlate: string,
  washServiceId: string,
  vehicleTypeId?: string
): Promise<WashOrder> {
  const body: CreateWashOrderRequest = {
    licensePlate,
    washServiceId,
    ...(vehicleTypeId && { vehicleTypeId }),
  }
  return apiPost<WashOrder>('/api/wash-orders', body)
}

export async function updateWashOrderStatus(
  id: string,
  status: WashOrderStatus
): Promise<WashOrder> {
  const body: UpdateWashOrderStatusRequest = { status }
  return apiPatch<WashOrder>(`/api/wash-orders/${id}/status`, body)
}

export async function listWashOrders(status?: WashOrderStatus): Promise<WashOrder[]> {
  const url = status
    ? `/api/wash-orders?status=${status}`
    : '/api/wash-orders'
  return apiGet<WashOrder[]>(url)
}
