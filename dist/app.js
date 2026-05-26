"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./middleware/error.middleware");
const wash_services_router_1 = require("./modules/wash-services/wash-services.router");
const app = (0, express_1.default)();
exports.app = app;
// Global middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// TODO (task 4.3): import and register parkingRouter
// app.use('/api/parking', parkingRouter);
// TODO (task 5.3): import and register washOrdersRouter
// app.use('/api/wash-orders', washOrdersRouter);
// Task 6.1: import and register washServicesRouter
app.use('/api/wash-services', wash_services_router_1.washServicesRouter);
// Centralized error handling — must be last
app.use(error_middleware_1.errorMiddleware);
//# sourceMappingURL=app.js.map