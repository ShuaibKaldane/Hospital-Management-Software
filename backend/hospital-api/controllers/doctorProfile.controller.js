const doctorProfileService = require("../services/doctorProfile.service");
const { success } = require("../utils/response.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

const getMyProfile = wrap(async (req, res) => {
    const data = await doctorProfileService.getMyProfile(req.user.id);
    return success(res, 200, "Profile fetched", data);
});

const updateMyProfile = wrap(async (req, res) => {
    const data = await doctorProfileService.updateMyProfile(req.user.id, req.body);
    return success(res, 200, "Profile updated", data);
});

const listAllDoctors = wrap(async (req, res) => {
    const filters = {
        status: req.query.status || "ACTIVE",
        category_id: req.query.category_id,
        search: req.query.search,
        limit: req.query.limit || 20,
        offset: req.query.offset || 0
    };
    const data = await doctorProfileService.listDoctors(filters);
    return success(res, 200, "Doctors fetched", data);
});

const getDoctorById = wrap(async (req, res) => {
    const data = await doctorProfileService.getDoctorById(Number(req.params.id));
    return success(res, 200, "Doctor fetched", data);
});

module.exports = {
    getMyProfile,
    updateMyProfile,
    listAllDoctors,
    getDoctorById
};