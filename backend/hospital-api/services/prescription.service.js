const prescriptionModel = require("../models/prescription.model");
const appointmentModel = require("../models/appointment.model");
const ApiError = require("../utils/error.util");
const validators = require("../utils/validators.util");

const createPrescription = async (doctorId, data) => {
    validators.requireFields(data, [
        "appointment_id",
        "diagnosis",
        "medicines"
    ]);

    const appointmentId = validators.isPositiveInt(data.appointment_id, "appointment_id");

    const appt = await appointmentModel.findById(appointmentId);
    if (!appt) throw new ApiError(404, "Appointment not found");
    if (appt.doctor_id !== doctorId) {
        throw new ApiError(403, "You did not handle this appointment");
    }
    if (!Array.isArray(data.medicines) || data.medicines.length === 0) {
        throw new ApiError(400, "medicines must be a non-empty array");
    }

    const id = await prescriptionModel.create({
        appointment_id: appointmentId,
        doctor_id: doctorId,
        patient_id: appt.patient_id,
        diagnosis: data.diagnosis,
        medicines: data.medicines,
        advice: data.advice
    });

    return prescriptionModel.findById(id);
};

const getMyPrescriptionsAsDoctor = async (doctorId) => {
    return prescriptionModel.findByDoctor(doctorId);
};

const getMyPrescriptionsAsPatient = async (patientId) => {
    return prescriptionModel.findByPatient(patientId);
};

module.exports = {
    createPrescription,
    getMyPrescriptionsAsDoctor,
    getMyPrescriptionsAsPatient
};