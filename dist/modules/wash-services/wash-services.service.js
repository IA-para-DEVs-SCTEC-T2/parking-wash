"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WashServicesService = void 0;
const supabase_1 = require("../../db/supabase");
const errors_1 = require("../../middleware/errors");
class WashServicesService {
    async listActiveServices() {
        const { data, error } = await supabase_1.supabase
            .from('wash_services')
            .select('*')
            .eq('is_active', true);
        if (error) {
            throw new errors_1.ServiceUnavailableError('Serviço temporariamente indisponível. Tente novamente em instantes');
        }
        return data || [];
    }
}
exports.WashServicesService = WashServicesService;
//# sourceMappingURL=wash-services.service.js.map