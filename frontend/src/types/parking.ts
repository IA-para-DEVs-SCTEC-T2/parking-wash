export type ParkingStatus = 'Parked' | 'Exited'

export interface ParkingRecord {
  id: string
  licensePlate: string
  entryTime: string
  exitTime?: string
  durationMinutes?: number
  totalAmount?: number
  status: ParkingStatus
}

export interface CheckInRequest {
  licensePlate: string
}

export interface CheckInResponse extends ParkingRecord {}

export interface CheckOutResponse extends ParkingRecord {}
