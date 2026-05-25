import { apiGet, apiPost, apiPatch } from './client';
import {
  WashOrder,
  WashOrderStatus,
  CreateWashOrderRequest,
  UpdateWashOrderStatusRequest,
} from '../types/washOrders';

const API_BASE_URL = '/api/wash-orders';

export async function createWashOrder(
  licensePlate: string,
  washServiceId: string
): Promise<WashOrder> {
  const body: CreateWashOrderRequest = {
    licensePlate,
    washServiceId,
  };
  return apiPost<WashOrder>(API_BASE_URL, body);
}

export async function updateWashOrderStatus(
  id: string,
  status: WashOrderStatus
): Promise<WashOrder> {
  const body: UpdateWashOrderStatusRequest = { status };
  return apiPatch<WashOrder>(`${API_BASE_URL}/${id}/status`, body);
}

export async function listWashOrders(status?: WashOrderStatus): Promise<WashOrder[]> {
  const url = status
    ? `${API_BASE_URL}?status=${status}`
    : API_BASE_URL;
  return apiGet<WashOrder[]>(url);
}
