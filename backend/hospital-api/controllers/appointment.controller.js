const appointmentService = require("../services/appointment.service");
const { success } = require("../utils/response.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

const bookAppointment = wrap(async (req, res) => {
    const data = await appointmentService.bookAppointment(req.user.id, req.body);
    return success(res, 201, "Appointment booked", data);
});

const getMyAppointments = wrap(async (req, res) => {
    const filters = { status: req.query.status };
    let data;

    if (req.user.role === "DOCTOR") {
        data = await appointmentService.getMyAppointmentsAsDoctor(req.user.id, filters);
    } else if (req.user.role === "PATIENT") {
        data = await appointmentService.getMyAppointmentsAsPatient(req.user.id, filters);
    }

    return success(res, 200, "Appointments fetched", data);
});

const listAllAppointments = wrap(async (req, res) => {
    const filters = {
        status: req.query.status,
        date: req.query.date
    };
    const data = await appointmentService.listAllAppointments(filters);
    return success(res, 200, "Appointments fetched", data);
});

const updateStatus = wrap(async (req, res) => {
    const data = await appointmentService.updateStatus(
        Number(req.params.id),
        req.body.status
    );
    return success(res, 200, "Status updated", data);
});

module.exports = {
    bookAppointment,
    getMyAppointments,
    listAllAppointments,
    updateStatus
};