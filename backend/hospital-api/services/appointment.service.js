const appointmentModel = require("../models/appointment.model");
const doctorProfileModel = require("../models/doctorProfile.model");
const userModel = require("../models/user.model");
const ApiError = require("../utils/error.util");
const validators = require("../utils/validators.util");

const bookAppointment = async (patientId, data) => {
    validators.requireFields(data, ["doctor_id", "appointment_date", "appointment_time"]);

    const doctorId = validators.isPositiveInt(data.doctor_id, "doctor_id");

    const doctor = await userModel.findUserById(doctorId);
    if (!doctor || doctor.role !== "DOCTOR") {
        throw new ApiError(404, "Doctor not found");
    }
    if (doctor.status !== "ACTIVE") {
        throw new ApiError(400, "Doctor account is not active");
    }

    // Doctor must have a profile to be bookable
    const profile = await doctorProfileModel.findByUserId(doctorId);
    if (!profile) throw new ApiError(400, "Doctor profile incomplete");

    const slotTaken = await appointmentModel.isSlotTaken(
        doctorId,
        data.appointment_date,
        data.appointment_time
    );
    if (slotTaken) throw new ApiError(409, "Slot already booked");

    const id = await appointmentModel.create({
        doctor_id: doctorId,
        patient_id: patientId,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time
    });

    return appointmentModel.findById(id);
};

const getMyAppointmentsAsDoctor = async (doctorId, filters) => {
    return appointmentModel.findByDoctor(doctorId, filters);
};

const getMyAppointmentsAsPatient = async (patientId, filters) => {
    return appointmentModel.findByPatient(patientId, filters);
};

const listAllAppointments = async (filters) => {
    return appointmentModel.findAll(filters);
};

const updateStatus = async (id, status) => {
    const allowed = ["Pending", "Approved", "Completed", "Cancelled"];
    if (!allowed.includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    const appt = await appointmentModel.findById(id);
    if (!appt) throw new ApiError(404, "Appointment not found");

    const ok = await appointmentModel.updateStatus(id, status);
    if (!ok) throw new ApiError(400, "Status update failed");

    return appointmentModel.findById(id);
};

module.exports = {
    bookAppointment,
    getMyAppointmentsAsDoctor,
    getMyAppointmentsAsPatient,
    listAllAppointments,
    updateStatus
};