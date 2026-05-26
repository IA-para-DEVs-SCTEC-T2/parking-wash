import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';
import { parkingRouter } from './modules/parking/parking.router';
import { washOrdersRouter } from './modules/wash-orders/wash-orders.router';
import { washServicesRouter } from './modules/wash-services/wash-services.router';
import vehicleTypesRouter from './modules/vehicle-types/vehicle-type.router';

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Vehicle Types routes
app.use('/api/vehicle-types', vehicleTypesRouter);

// Task 4.3: import and register parkingRouter
app.use('/api/parking', parkingRouter);

// Task 5.3: import and register washOrdersRouter
app.use('/api/wash-orders', washOrdersRouter);

// Task 6.1: import and register washServicesRouter
app.use('/api/wash-services', washServicesRouter);

// Centralized error handling — must be last
app.use(errorMiddleware);

export { app };
