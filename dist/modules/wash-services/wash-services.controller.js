"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WashServicesController = void 0;
const wash_services_service_1 = require("./wash-services.service");
class WashServicesController {
    constructor() {
        this.service = new wash_services_service_1.WashServicesService();
    }
    async getWashServices(_req, res, next) {
        try {
            const services = await this.service.listActiveServices();
            res.status(200).json(services);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WashServicesController = WashServicesController;
//# sourceMappingURL=wash-services.controller.js.map