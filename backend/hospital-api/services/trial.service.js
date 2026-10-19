const bcrypt = require("bcrypt");

const ApiError = require("../utils/error.util");
const validators = require("../utils/validators.util");
const userModel = require("../models/user.model");
const authModel = require("../models/auth.model");
const hospitalModel = require("../models/hospital.model");

/**
 * Generate a friendly temporary password:
 *   - 12 chars
 *   - mixed case + digits + symbols
 *   - excludes look-alikes (0/O/1/l/I)
 */
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

/**
 * Activate a 7-day free trial.
 *
 * Side effects:
 *   - inserts an ADMIN row in `users` with bcrypt-hashed password
 *   - inserts the tenant row in `hospitals` (plan='trial', trial=1,
 *     trial_expires_at = NOW() + 7 days)
 *
 * Returns a record safe for the client (includes plaintext password
 * one time — that is the whole point of trial signup).
 */
const activateTrial = async (data) => {
    const { hospitalName, adminName, adminEmail, phone, city, address } = data;

    validators.requireFields(data, [
        "hospitalName",
        "adminName",
        "adminEmail",
        "phone",
        "city"
    ]);

    if (!validators.isEmail(adminEmail)) {
        throw new ApiError(400, "Invalid email format");
    }

    const existing = await authModel.findUserByEmail(adminEmail);
    if (existing) throw new ApiError(409, "Email already registered");

    const tempPassword = generateTempPassword(12);

    const adminUserId = await userModel.createUser({
        name: adminName,
        email: adminEmail,
        password: tempPassword,
        role: "ADMIN",
        status: "ACTIVE"
    });

    const hospitalId = await hospitalModel.createHospital({
        name: hospitalName,
        city,
        address,
        phone,
        admin_user_id: adminUserId,
        plan: "trial",
        trial: true,
        trial_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return {
        adminEmail,
        adminPassword: tempPassword,
        hospitalId,
        hospitalName,
        city,
        address: address || "",
        phone,
        plan: "trial",
        trialExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        loginUrl: "/login"
    };
};

module.exports = {
    activateTrial,
    generateTempPassword
};
