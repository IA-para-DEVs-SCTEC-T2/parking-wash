import { Router } from 'express';
import { WashServicesController } from './wash-services.controller';

const router = Router();
const controller = new WashServicesController();

router.get('/', (req, res, next) => controller.getWashServices(req, res, next));

export { router as washServicesRouter };
