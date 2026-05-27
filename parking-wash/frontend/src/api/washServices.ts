import { apiGet } from './client'
import { WashService } from '../types/washOrders'

export async function listWashServices(): Promise<WashService[]> {
  return apiGet<WashService[]>('/api/wash-services')
}
