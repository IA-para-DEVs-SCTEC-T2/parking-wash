"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const errors_1 = require("./errors");
function errorMiddleware(err, _req, res, _next) {
    const isProd = process.env.NODE_ENV === 'production';
    if (err instanceof errors_1.AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            statusCode: err.statusCode,
            ...(isProd ? {} : { stack: err.stack }),
        });
        return;
    }
    // Erro não tratado
    console.error('[Unhandled Error]', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        statusCode: 500,
        ...(isProd ? {} : { stack: err.stack }),
    });
}
//# sourceMappingURL=error.middleware.js.map