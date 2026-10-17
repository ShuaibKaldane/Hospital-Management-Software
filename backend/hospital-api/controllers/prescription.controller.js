const prescriptionService = require("../services/prescription.service");
const { success } = require("../utils/response.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

const createPrescription = wrap(async (req, res) => {
    const data = await prescriptionService.createPrescription(req.user.id, req.body);
    return success(res, 201, "Prescription created", data);
});

const getMyPrescriptions = wrap(async (req, res) => {
    let data;
    if (req.user.role === "DOCTOR") {
        data = await prescriptionService.getMyPrescriptionsAsDoctor(req.user.id);
    } else if (req.user.role === "PATIENT") {
        data = await prescriptionService.getMyPrescriptionsAsPatient(req.user.id);
    }
    return success(res, 200, "Prescriptions fetched", data || []);
});

module.exports = {
    createPrescription,
    getMyPrescriptions
};