/**
 * Controller layer for parking operations
 * Handles HTTP request/response serialization for parking endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { ParkingService } from './parking.service';
import { CheckInRequest, CheckOutRequest } from './parking.types';
import { getVehicleData } from './services/fipe.service';

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
      // Support both string (backward compatibility) and object formats
      const body = req.body;
      let licensePlate: string;
      let vehicleTypeId: string | undefined;

      if (typeof body === 'string') {
        licensePlate = body;
      } else if (typeof body === 'object' && body.licensePlate) {
        licensePlate = body.licensePlate;
        vehicleTypeId = body.vehicleTypeId;
      } else {
        res.status(422).json({ error: 'licensePlate é obrigatório' });
        return;
      }

      const result = await this.service.checkIn({
        licensePlate,
        vehicleTypeId,
      });
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
      const { applyDailyRate, paymentMethodId } = req.body as CheckOutRequest;
      
      const result = await this.service.checkOut(id, {
        applyDailyRate,
        paymentMethodId,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle GET /api/parking/history
   * Lists last 10 exited parking records
   * @returns HTTP 200 with array of ParkingRecords
   */
  async getHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.service.getHistory();
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

  /**
   * Handle GET /api/parking/fipe/:licensePlate
   * Retrieves vehicle information from FIPE API by license plate
   * @returns HTTP 200 with vehicle information (brand, model, year, fuel, value)
   */
  async getFipeData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const licensePlate = Array.isArray(req.params.licensePlate) 
        ? req.params.licensePlate[0] 
        : req.params.licensePlate;
      
      if (!licensePlate) {
        res.status(422).json({ error: 'licensePlate é obrigatório' });
        return;
      }

      const vehicleInfo = await getVehicleData(licensePlate);
      res.status(200).json(vehicleInfo);
    } catch (error) {
      next(error);
    }
  }
}
