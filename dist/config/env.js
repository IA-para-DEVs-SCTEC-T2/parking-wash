"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
const hourlyRate = parseFloat(process.env.HOURLY_RATE ?? '10.00');
const dailyRateCap = parseFloat(process.env.DAILY_RATE_CAP ?? '80.00');
exports.config = {
    port: parseInt(process.env.PORT ?? '3333', 10),
    supabaseUrl: process.env.SUPABASE_URL ?? '',
    supabaseKey: process.env.SUPABASE_SERVICE_KEY ?? '',
    hourlyRate: hourlyRate <= 0 ? 10.00 : hourlyRate,
    dailyRateCap: dailyRateCap <= 0 ? 80.00 : dailyRateCap,
};
//# sourceMappingURL=env.js.map