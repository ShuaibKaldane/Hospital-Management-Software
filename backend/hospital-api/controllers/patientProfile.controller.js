const patientProfileService = require("../services/patientProfile.service");
const { success } = require("../utils/response.util");

const wrap = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

const getMyProfile = wrap(async (req, res) => {
    const data = await patientProfileService.getMyProfile(req.user.id);
    return success(res, 200, "Profile fetched", data);
});

const updateMyProfile = wrap(async (req, res) => {
    const data = await patientProfileService.updateMyProfile(req.user.id, req.body);
    return success(res, 200, "Profile updated", data);
});

module.exports = {
    getMyProfile,
    updateMyProfile
};