const paymentModel = require("../models/payment.model");
const appointmentModel = require("../models/appointment.model");
const doctorProfileModel = require("../models/doctorProfile.model");
const ApiError = require("../utils/error.util");
const validators = require("../utils/validators.util");

/**
 * Patient initiates payment for an appointment.
 * Amount defaults to the doctor's consultation_fee.
 */
const makePayment = async (patientId, data) => {
    validators.requireFields(data, ["appointment_id", "payment_method"]);

    const appt = await appointmentModel.findById(data.appointment_id);
    if (!appt) throw new ApiError(404, "Appointment not found");
    if (appt.patient_id !== patientId) {
        throw new ApiError(403, "Not your appointment");
    }

    let amount = data.amount;
    if (amount === undefined || amount === null) {
        const profile = await doctorProfileModel.findByUserId(appt.doctor_id);
        amount = profile ? profile.consultation_fee : 0;
    }
    amount = validators.isNonNegativeNumber(amount, "amount");

    const id = await paymentModel.create({
        appointment_id: appt.id,
        patient_id: patientId,
        doctor_id: appt.doctor_id,
        amount,
        payment_method: data.payment_method,
        payment_status: "Paid",
        paid_at: new Date()
    });

    return paymentModel.findByPatient(patientId).then(list => list.find(p => p.id === id));
};

const markStatus = async (id, status) => {
    const allowed = ["Pending", "Paid", "Failed", "Refunded"];
    if (!allowed.includes(status)) {
        throw new ApiError(400, "Invalid payment_status");
    }
    const ok = await paymentModel.updateStatus(id, status);
    if (!ok) throw new ApiError(404, "Payment not found");
    return { id, payment_status: status };
};

const getMyPaymentsAsPatient = async (patientId) => {
    return paymentModel.findByPatient(patientId);
};

const getMyPaymentsAsDoctor = async (doctorId) => {
    return paymentModel.findByDoctor(doctorId);
};

const getAllPayments = async () => {
    return paymentModel.findAll();
};

module.exports = {
    makePayment,
    markStatus,
    getMyPaymentsAsPatient,
    getMyPaymentsAsDoctor,
    getAllPayments
};