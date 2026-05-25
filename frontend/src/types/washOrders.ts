export type WashOrderStatus = 'Waiting' | 'InProgress' | 'Completed';

export interface WashService {
  id: string;
  name: string;
  price: number;
  duration_estimate: number;
}

export interface WashOrder {
  id: string;
  licensePlate: string;
  washService: Pick<WashService, 'id' | 'name' | 'price'>;
  status: WashOrderStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface CreateWashOrderRequest {
  licensePlate: string;
  washServiceId: string;
}

export interface UpdateWashOrderStatusRequest {
  status: WashOrderStatus;
}
