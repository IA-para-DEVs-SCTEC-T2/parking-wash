export type WashOrderStatus = 'Waiting' | 'InProgress' | 'Completed';

export interface WashService {
  id: string;
  name: string;
  price: number;
  duration_estimate: number;
}

export interface VehicleType {
  id: string;
  name: string;
  code: string;
  hourlyRate?: number;
  dailyRate?: number;
  isActive?: boolean;
}

export interface WashOrder {
  id: string;
  licensePlate: string;
  washService: Pick<WashService, 'id' | 'name' | 'price'>;
  vehicleType?: VehicleType;
  status: WashOrderStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface CreateWashOrderRequest {
  licensePlate: string;
  washServiceId: string;
  vehicleTypeId?: string;
}

export interface UpdateWashOrderStatusRequest {
  status: WashOrderStatus;
}
