/**
 * Router for parking endpoints
 * Defines routes for check-in, check-out, and listing parking records
 */

import { Router } from 'express';
import { ParkingController } from './parking.controller';
import { validate } from '../../middleware/validate.middleware';
import { checkInSchema } from './parking.validator';

const router = Router();
const controller = new ParkingController();

/**
 * POST /api/parking/checkin
 * Register a vehicle entry
 * Validates licensePlate using checkInSchema
 */
router.post(
  '/checkin',
  validate(checkInSchema),
  (req, res, next) => controller.postCheckIn(req, res, next)
);

/**
 * POST /api/parking/:id/checkout
 * Register a vehicle exit and calculate parking fee
 */
router.post(
  '/:id/checkout',
  (req, res, next) => controller.postCheckOut(req, res, next)
);

/**
 * GET /api/parking
 * List parking records with optional status filter
 */
router.get(
  '/',
  (req, res, next) => controller.getParking(req, res, next)
);

export { router as parkingRouter };
