/**
 * Public hospital signup — used by the marketing checkout and trial pages.
 *
 *   POST /api/hospitals
 *     body: { hospitalName, adminName, adminEmail, phone, city, address, plan, days }
 *
 * Atomically creates the tenant admin user, the hospital row, and links them.
 * No auth — anyone can buy a plan.
 *
 * Plan IDs:
 *   - 'basic' | 'pro' | 'enterprise'   → paid plans (subscription window)
 *   - 'trial'                          → 7-day trial (handled by /api/trial; same shape)
 */
const bcrypt = require("bcrypt");

const ApiError = require("../utils/error.util");
const validators = require("../utils/validators.util");
const userModel = require("../models/user.model");
const authModel = require("../models/auth.model");
const hospitalModel = require("../models/hospital.model");

const ALLOWED_PLANS = ["basic", "pro", "enterprise"];

const createHospitalCheckout = async (data) => {
    const {
        hospitalName,
        adminName,
        adminEmail,
        phone,
        city,
        address,
        plan = "pro",
        days = 30
    } = data;

    validators.requireFields(data, [
        "hospitalName", "adminName", "adminEmail", "phone", "city"
    ]);

    if (!validators.isEmail(adminEmail)) {
        throw new ApiError(400, "Invalid email format");
    }
    if (!ALLOWED_PLANS.includes(plan)) {
        throw new ApiError(400, `Invalid plan. Allowed: ${ALLOWED_PLANS.join(", ")}`);
    }

    const existing = await authModel.findUserByEmail(adminEmail);
    if (existing) throw new ApiError(409, "Admin email already registered");

    const tempPassword = generateTempPassword(12);
    const n = Number(days) || 30;
    const subscriptionExpiresAt = new Date(Date.now() + n * 24 * 60 * 60 * 1000);

    const adminUserId = await userModel.createUser({
        name: adminName,
        email: adminEmail,
        password: tempPassword,
        role: "ADMIN",
        status: "ACTIVE",
        hospital_id: null
    });

    const hospitalId = await hospitalModel.createHospital({
        name: hospitalName,
        city,
        address,
        phone,
        admin_user_id: adminUserId,
        plan,
        trial: false,
        trial_expires_at: null,
        subscription_expires_at: subscriptionExpiresAt
    });

    await userModel.updateUserHospital(adminUserId, hospitalId);

    return {
        adminEmail,
        adminPassword: tempPassword,
        hospitalId,
        hospitalName,
        city,
        address: address || "",
        phone,
        plan,
        trialExpiresAt: null,
        subscriptionExpiresAt: subscriptionExpiresAt.toISOString(),
        loginUrl: "/login"
    };
};

const generateTempPassword = (length = 12) => {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghjkmnpqrstuvwxyz";
    const nums  = "23456789";
    const syms  = "@#$%&*!";

    const pick = (s) => s[Math.floor(Math.random() * s.length)];
    const all  = upper + lower + nums + syms;

    const chars = [pick(upper), pick(lower), pick(nums), pick(syms)];
    while (chars.length < length) chars.push(pick(all));

    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
};

module.exports = {
    createHospitalCheckout,
    generateTempPassword
};
