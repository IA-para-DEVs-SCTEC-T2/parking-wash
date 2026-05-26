/**
 * Router for vehicle type endpoints
 * Defines all routes for vehicle type operations
 */

import { Router } from 'express';
import { VehicleTypeController } from './vehicle-type.controller';

const router = Router();
const controller = new VehicleTypeController();

/**
 * GET /api/vehicle-types
 * List all active vehicle types
 */
router.get('/', (req, res) => controller.listActive(req, res));

/**
 * PATCH /api/vehicle-types/:id
 * Update vehicle type rates
 */
router.patch('/:id', (req, res) => controller.updateRates(req, res));

export default router;
