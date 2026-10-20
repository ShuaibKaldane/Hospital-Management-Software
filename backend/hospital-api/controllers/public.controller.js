const checkoutService = require("../services/hospital.service.checkout");
const { success } = require("../utils/response.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

/**
 * Public endpoint for the marketing checkout flow.
 * Creates an admin user + hospital row so the new tenant appears in the
 * public `/api/hospitals` directory and in signup dropdowns.
 */
const createHospital = wrap(async (req, res) => {
    const result = await checkoutService.createHospitalCheckout(req.body);
    return success(res, 201,
        "Hospital activated. Save the password — it is shown only once.",
        result);
});

module.exports = { createHospital };
