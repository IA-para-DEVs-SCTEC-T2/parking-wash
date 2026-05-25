import { apiGet } from './client';
import { WashService } from '../types/washOrders';

const API_BASE_URL = '/api/wash-services';

export async function listWashServices(): Promise<WashService[]> {
  return apiGet<WashService[]>(API_BASE_URL);
}
