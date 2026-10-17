const doctorProfileModel = require("../models/doctorProfile.model");
const userModel = require("../models/user.model");
const doctorCategoryModel = require("../models/doctorCategory.model");
const ApiError = require("../utils/error.util");

const getMyProfile = async (userId) => {
    const profile = await doctorProfileModel.findByUserId(userId);
    if (!profile) throw new ApiError(404, "Doctor profile not found");
    return profile;
};

const updateMyProfile = async (userId, fields) => {
    if (fields.category_id) {
        const cat = await doctorCategoryModel.findById(fields.category_id);
        if (!cat) throw new ApiError(400, "Invalid category_id");
    }

    const ok = await doctorProfileModel.update(userId, fields);
    if (!ok) throw new ApiError(400, "Update failed");

    return doctorProfileModel.findByUserId(userId);
};

const listDoctors = async (filters) => {
    return doctorProfileModel.findAll(filters);
};

const approveDoctor = async (userId) => {
    const user = await userModel.findUserById(userId);
    if (!user || user.role !== "DOCTOR") {
        throw new ApiError(404, "Doctor not found");
    }

    const ok = await userModel.updateUserStatus(userId, "ACTIVE");
    if (!ok) throw new ApiError(400, "Approval failed");

    return { id: userId, status: "ACTIVE" };
};

const blockDoctor = async (userId) => {
    const user = await userModel.findUserById(userId);
    if (!user || user.role !== "DOCTOR") {
        throw new ApiError(404, "Doctor not found");
    }

    const ok = await userModel.updateUserStatus(userId, "BLOCKED");
    if (!ok) throw new ApiError(400, "Block failed");

    return { id: userId, status: "BLOCKED" };
};

const getDoctorById = async (userId) => {
    const profile = await doctorProfileModel.findByUserId(userId);
    if (!profile) throw new ApiError(404, "Doctor not found");
    return profile;
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    listDoctors,
    approveDoctor,
    blockDoctor,
    getDoctorById
};