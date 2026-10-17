const adminService = require("../services/admin.service");
const { success } = require("../utils/response.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

const getDashboard = wrap(async (req, res) => {
    const stats = await adminService.getDashboardStats();
    return success(res, 200, "Dashboard stats fetched", stats);
});

const listDoctors = wrap(async (req, res) => {
    const filters = {
        status: req.query.status,
        category_id: req.query.category_id,
        search: req.query.search,
        limit: req.query.limit || 20,
        offset: req.query.offset || 0
    };
    const data = await adminService.listAllDoctors(filters);
    return success(res, 200, "Doctors fetched", data);
});

const approveDoctor = wrap(async (req, res) => {
    await adminService.approveDoctor(Number(req.params.id));
    return success(res, 200, "Doctor approved", { id: req.params.id, status: "ACTIVE" });
});

const blockDoctor = wrap(async (req, res) => {
    await adminService.blockDoctor(Number(req.params.id));
    return success(res, 200, "Doctor blocked", { id: req.params.id, status: "BLOCKED" });
});

module.exports = {
    getDashboard,
    listDoctors,
    approveDoctor,
    blockDoctor
};