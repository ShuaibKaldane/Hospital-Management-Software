const superAdminService = require("../services/superAdmin.service");
const { success } = require("../utils/response.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

const getDashboard = wrap(async (req, res) => {
    const stats = await superAdminService.getPlatformStats();
    return success(res, 200, "Platform stats fetched", stats);
});

const listHospitals = wrap(async (req, res) => {
    const data = await superAdminService.listAllHospitals({
        search: req.query.search,
        plan: req.query.plan
    });
    return success(res, 200, "Hospitals fetched", data);
});

const addHospital = wrap(async (req, res) => {
    const data = await superAdminService.addHospital(req.body);
    return success(res, 201, "Hospital added. Share these credentials with the admin.", data);
});

const updatePlan = wrap(async (req, res) => {
    const data = await superAdminService.updateHospitalPlan(
        Number(req.params.id),
        req.body
    );
    return success(res, 200, "Plan updated", data);
});

const removeHospital = wrap(async (req, res) => {
    const data = await superAdminService.removeHospital(Number(req.params.id));
    return success(res, 200, "Hospital removed", data);
});

const listDoctors = wrap(async (req, res) => {
    const data = await superAdminService.listAllDoctors({
        search: req.query.search,
        status: req.query.status,
        hospital_id: req.query.hospital_id,
        limit: req.query.limit || 50,
        offset: req.query.offset || 0
    });
    return success(res, 200, "Doctors fetched", data);
});

const listPatients = wrap(async (req, res) => {
    const data = await superAdminService.listAllPatients({
        search: req.query.search,
        status: req.query.status,
        hospital_id: req.query.hospital_id,
        limit: req.query.limit || 50,
        offset: req.query.offset || 0
    });
    return success(res, 200, "Patients fetched", data);
});

const listPayments = wrap(async (req, res) => {
    const data = await superAdminService.listAllPayments({
        hospital_id: req.query.hospital_id
    });
    return success(res, 200, "Payments fetched", data);
});

const listAppointments = wrap(async (req, res) => {
    const data = await superAdminService.listAllAppointments({
        status: req.query.status,
        hospital_id: req.query.hospital_id
    });
    return success(res, 200, "Appointments fetched", data);
});

module.exports = {
    getDashboard,
    listHospitals,
    addHospital,
    updatePlan,
    removeHospital,
    listDoctors,
    listPatients,
    listPayments,
    listAppointments
};
