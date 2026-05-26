"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const errors_1 = require("./errors");
function validate(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const firstMessage = result.error.errors[0]?.message ?? 'Dados inválidos';
            return next(new errors_1.ValidationError(firstMessage));
        }
        next();
    };
}
//# sourceMappingURL=validate.middleware.js.map