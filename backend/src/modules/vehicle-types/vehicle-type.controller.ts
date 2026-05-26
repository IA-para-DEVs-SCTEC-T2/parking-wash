/**
 * Controller layer for vehicle type operations
 * Handles HTTP requests and responses for vehicle type endpoints
 */

import { Request, Response } from 'express';
import { VehicleTypeService } from './vehicle-type.service';
import { UpdateRatesRequest } from './vehicle-type.types';
import { ValidationError, NotFoundError } from '../../middleware/errors';

export class VehicleTypeController {
  private service = new VehicleTypeService();

  /**
   * GET /api/vehicle-types
   * List all active vehicle types
   */
  async listActive(req: Request, res: Response): Promise<void> {
    try {
      const vehicleTypes = await this.service.listActive();
      res.status(200).json(vehicleTypes);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro ao listar tipos de veículos' });
      }
    }
  }

  /**
   * PATCH /api/vehicle-types/:id
   * Update vehicle type rates
   */
  async updateRates(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { hourlyRate, dailyRate } = req.body as UpdateRatesRequest;

      // Validate request body
      if (hourlyRate === undefined || dailyRate === undefined) {
        res.status(422).json({
          error: 'hourlyRate e dailyRate são obrigatórios',
        });
        return;
      }

      if (typeof hourlyRate !== 'number' || typeof dailyRate !== 'number') {
        res.status(422).json({
          error: 'hourlyRate e dailyRate devem ser números',
        });
        return;
      }

      const updatedVehicleType = await this.service.updateRates(id, hourlyRate, dailyRate);

      res.status(200).json(updatedVehicleType);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(422).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro ao atualizar tipo de veículo' });
      }
    }
  }
}
