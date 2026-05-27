/**
 * Controller layer for parking operations
 * Handles HTTP request/response serialization for parking endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { ParkingService } from './parking.service';

export class ParkingController {
  private service: ParkingService;

  constructor() {
    this.service = new ParkingService();
  }

  /**
   * Handle POST /api/parking/checkin
   * Registers a vehicle entry into the parking lot
   * @returns HTTP 201 with CheckInResponse
   */
  async postCheckIn(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { licensePlate } = req.body;
      const result = await this.service.checkIn(licensePlate);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle POST /api/parking/:id/checkout
   * Registers a vehicle exit and calculates parking fee
   * @returns HTTP 200 with CheckOutResponse
   */
  async postCheckOut(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.service.checkOut(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle GET /api/parking
   * Lists parking records with optional status filter
   * @returns HTTP 200 with array of ParkingRecords
   */
  async getParking(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status } = req.query;
      const result = await this.service.listRecords(status as string | undefined);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
