const paymentService = require("../services/payment.service");
const { success } = require("../utils/response.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

const makePayment = wrap(async (req, res) => {
    const data = await paymentService.makePayment(req.user.id, req.body);
    return success(res, 201, "Payment recorded", data);
});

const updatePaymentStatus = wrap(async (req, res) => {
    const data = await paymentService.markStatus(
        Number(req.params.id),
        req.body.payment_status
    );
    return success(res, 200, "Payment status updated", data);
});

const getMyPayments = wrap(async (req, res) => {
    let data;
    if (req.user.role === "PATIENT") {
        data = await paymentService.getMyPaymentsAsPatient(req.user.id);
    } else if (req.user.role === "DOCTOR") {
        data = await paymentService.getMyPaymentsAsDoctor(req.user.id);
    }
    return success(res, 200, "Payments fetched", data || []);
});

const getAllPayments = wrap(async (req, res) => {
    const data = await paymentService.getAllPayments();
    return success(res, 200, "All payments fetched", data);
});

module.exports = {
    makePayment,
    updatePaymentStatus,
    getMyPayments,
    getAllPayments
};