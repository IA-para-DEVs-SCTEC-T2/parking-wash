import { Request, Response, NextFunction } from 'express';
import { WashOrderService } from './wash-orders.service';
import { CreateWashOrderRequest, UpdateWashOrderStatusRequest } from './wash-orders.validator';

export class WashOrdersController {
  private service: WashOrderService;

  constructor() {
    this.service = new WashOrderService();
  }

  /**
   * POST /api/wash-orders
   * Creates a new wash order
   * @returns HTTP 201 with WashOrderResponse
   */
  async postWashOrder(
    req: Request<{}, {}, CreateWashOrderRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { licensePlate, washServiceId, vehicleTypeId } = req.body;
      const order = await this.service.createOrder(licensePlate, washServiceId, vehicleTypeId);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/wash-orders/:id/status
   * Updates the status of a wash order
   * @returns HTTP 200 with updated WashOrderResponse
   */
  async patchWashOrderStatus(
    req: Request<{ id: string }, {}, UpdateWashOrderStatusRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await this.service.advanceStatus(id, status);
      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/wash-orders
   * Lists wash orders, optionally filtered by status
   * @query status - Optional filter (Waiting, InProgress, or Completed)
   * @returns HTTP 200 with array of WashOrderResponse
   */
  async getWashOrders(
    req: Request<{}, {}, {}, { status?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status } = req.query;
      const orders = await this.service.listOrders(status);
      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }
}
