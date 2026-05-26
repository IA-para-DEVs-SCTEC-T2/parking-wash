"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.washServicesRouter = void 0;
const express_1 = require("express");
const wash_services_controller_1 = require("./wash-services.controller");
const router = (0, express_1.Router)();
exports.washServicesRouter = router;
const controller = new wash_services_controller_1.WashServicesController();
router.get('/', (req, res, next) => controller.getWashServices(req, res, next));
//# sourceMappingURL=wash-services.router.js.map