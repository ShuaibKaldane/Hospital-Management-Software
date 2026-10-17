const reportModel = require("../models/patientReport.model");
const appointmentModel = require("../models/appointment.model");
const ApiError = require("../utils/error.util");

/**
 * Patient uploads a medical report tied to an appointment.
 */
const uploadReport = async (patientId, { appointment_id, report_name, file_path }) => {
    if (!file_path) throw new ApiError(400, "file is required");

    const appt = await appointmentModel.findById(appointment_id);
    if (!appt) throw new ApiError(404, "Appointment not found");
    if (appt.patient_id !== patientId) {
        throw new ApiError(403, "You can only upload for your own appointments");
    }

    const id = await reportModel.create({
        appointment_id,
        patient_id: patientId,
        doctor_id: appt.doctor_id,
        report_name: report_name || "Report",
        file_path
    });

    return reportModel.findByPatient(patientId).then(list => list.find(r => r.id === id));
};

const getMyReportsAsPatient = async (patientId) => {
    return reportModel.findByPatient(patientId);
};

const getMyReportsAsDoctor = async (doctorId) => {
    return reportModel.findByDoctor(doctorId);
};

module.exports = {
    uploadReport,
    getMyReportsAsPatient,
    getMyReportsAsDoctor
};