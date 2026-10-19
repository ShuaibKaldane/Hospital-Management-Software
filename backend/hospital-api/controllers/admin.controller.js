const adminService = require("../services/admin.service");
const { success } = require("../utils/response.util");
const ApiError = require("../utils/error.util");
const validators = require("../utils/validators.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

const requireHospital = (req) => {
    if (!req.user.hospital_id) {
        throw new ApiError(400, "Your account is not linked to a hospital. Contact support.");
    }
    return req.user.hospital_id;
};

const getDashboard = wrap(async (req, res) => {
    const hospitalId = requireHospital(req);
    const stats = await adminService.getDashboardStats(hospitalId);
    return success(res, 200, "Dashboard stats fetched", stats);
});

const listDoctors = wrap(async (req, res) => {
    const hospitalId = requireHospital(req);
    const filters = {
        status: req.query.status,
        category_id: req.query.category_id,
        search: req.query.search,
        hospital_id: hospitalId,
        limit: req.query.limit || 20,
        offset: req.query.offset || 0
    };
    const data = await adminService.listAllDoctors(filters);
    return success(res, 200, "Doctors fetched", data);
});

const listPatients = wrap(async (req, res) => {
    const hospitalId = requireHospital(req);
    const filters = {
        status: req.query.status,
        search: req.query.search,
        hospital_id: hospitalId,
        limit: req.query.limit || 20,
        offset: req.query.offset || 0
    };
    const data = await adminService.listAllPatients(filters);
    return success(res, 200, "Patients fetched", data);
});

const approveDoctor = wrap(async (req, res) => {
    await adminService.approveDoctor(Number(req.params.id));
    return success(res, 200, "Doctor approved", { id: req.params.id, status: "ACTIVE" });
});

const blockDoctor = wrap(async (req, res) => {
    await adminService.blockDoctor(Number(req.params.id));
    return success(res, 200, "Doctor blocked", { id: req.params.id, status: "BLOCKED" });
});

const addDoctor = wrap(async (req, res) => {
    const hospitalId = requireHospital(req);
    validators.requireFields(req.body, [
        "name", "email", "password", "category_id", "qualification"
    ]);
    if (!validators.isEmail(req.body.email)) {
        throw new ApiError(400, "Invalid email format");
    }
    const data = await adminService.addDoctor(hospitalId, req.body);
    return success(res, 201, "Doctor added", data);
});

const addPatient = wrap(async (req, res) => {
    const hospitalId = requireHospital(req);
    validators.requireFields(req.body, ["name", "email", "password"]);
    if (!validators.isEmail(req.body.email)) {
        throw new ApiError(400, "Invalid email format");
    }
    const data = await adminService.addPatient(hospitalId, req.body);
    return success(res, 201, "Patient added", data);
});

module.exports = {
    getDashboard,
    listDoctors,
    listPatients,
    approveDoctor,
    blockDoctor,
    addDoctor,
    addPatient
};
