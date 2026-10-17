const patientProfileModel = require("../models/patientProfile.model");
const ApiError = require("../utils/error.util");

const getMyProfile = async (userId) => {
    const profile = await patientProfileModel.findByUserId(userId);
    if (!profile) throw new ApiError(404, "Patient profile not found");
    return profile;
};

const updateMyProfile = async (userId, fields) => {
    const ok = await patientProfileModel.update(userId, fields);
    if (!ok) throw new ApiError(400, "Update failed");

    return patientProfileModel.findByUserId(userId);
};

module.exports = {
    getMyProfile,
    updateMyProfile
};