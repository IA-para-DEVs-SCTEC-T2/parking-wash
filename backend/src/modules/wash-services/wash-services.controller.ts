import { Request, Response, NextFunction } from 'express';
import { WashServicesService } from './wash-services.service';

export class WashServicesController {
  private service: WashServicesService;

  constructor() {
    this.service = new WashServicesService();
  }

  async getWashServices(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const services = await this.service.listActiveServices();
      res.status(200).json(services);
    } catch (error) {
      next(error);
    }
  }
}
