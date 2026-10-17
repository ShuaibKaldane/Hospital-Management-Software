const authModel = require("../models/auth.model");
const userModel = require("../models/user.model");
const doctorProfileModel = require("../models/doctorProfile.model");
const patientProfileModel = require("../models/patientProfile.model");
const doctorCategoryModel = require("../models/doctorCategory.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/error.util");
const validators = require("../utils/validators.util");

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

const sanitizeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
});

const loginByRole = async (data, expectedRole) => {
    const { email, password } = data;

    validators.requireFields(data, ["email", "password"]);
    if (!validators.isEmail(email)) throw new ApiError(400, "Invalid email format");

    const user = await authModel.findUserByEmail(email);
    if (!user) throw new ApiError(404, "User not found");

    if (user.role !== expectedRole) {
        throw new ApiError(403, "Access denied for your role");
    }

    if (user.status !== "ACTIVE") {
        throw new ApiError(403, "Account is not active. Contact admin.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new ApiError(401, "Invalid email or password");

    const token = generateToken(user);

    return { token, user: sanitizeUser(user) };
};

const adminLogin = async (data) => {
    return loginByRole(data, "ADMIN");
};

const doctorLogin = async (data) => {
    return loginByRole(data, "DOCTOR");
};

const patientLogin = async (data) => {
    return loginByRole(data, "PATIENT");
};

/**
 * Doctor signup.
 * Creates user (status = PENDING) + doctor_profile in one flow.
 */
const doctorSignup = async (data) => {
    validators.requireFields(data, [
        "name",
        "email",
        "password",
        "category_id",
        "qualification"
    ]);

    if (!validators.isEmail(data.email)) {
        throw new ApiError(400, "Invalid email format");
    }

    const existing = await authModel.findUserByEmail(data.email);
    if (existing) throw new ApiError(409, "Email already registered");

    const category = await doctorCategoryModel.findById(data.category_id);
    if (!category) throw new ApiError(400, "Invalid doctor category");

    const userId = await userModel.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "DOCTOR",
        status: "PENDING"
    });

    await doctorProfileModel.create({
        user_id: userId,
        category_id: data.category_id,
        qualification: data.qualification,
        experience: data.experience || 0,
        consultation_fee: data.consultation_fee || 0,
        phone: data.phone,
        address: data.address
    });

    return {
        user_id: userId,
        status: "PENDING",
        message: "Registration successful. Awaiting admin approval."
    };
};

/**
 * Patient signup.
 * Creates user (status = ACTIVE) + patient_profile.
 */
const patientSignup = async (data) => {
    validators.requireFields(data, ["name", "email", "password"]);

    if (!validators.isEmail(data.email)) {
        throw new ApiError(400, "Invalid email format");
    }

    const existing = await authModel.findUserByEmail(data.email);
    if (existing) throw new ApiError(409, "Email already registered");

    const userId = await userModel.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "PATIENT",
        status: "ACTIVE"
    });

    await patientProfileModel.create({
        user_id: userId,
        age: data.age,
        gender: data.gender,
        blood_group: data.blood_group,
        phone: data.phone,
        address: data.address
    });

    const user = await userModel.findUserById(userId);
    const token = generateToken(user);

    return {
        token,
        user: sanitizeUser(user),
        message: "Registration successful"
    };
};

module.exports = {
    adminLogin,
    doctorLogin,
    patientLogin,
    doctorSignup,
    patientSignup
};