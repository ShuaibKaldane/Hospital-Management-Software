const userModel = require("../models/user.model");
const hospitalModel = require("../models/hospital.model");
const doctorProfileModel = require("../models/doctorProfile.model");
const patientProfileModel = require("../models/patientProfile.model");
const paymentModel = require("../models/payment.model");
const appointmentModel = require("../models/appointment.model");
const pool = require("../config/database");
const bcrypt = require("bcrypt");
const ApiError = require("../utils/error.util");
const validators = require("../utils/validators.util");
const authModel = require("../models/auth.model");

/**
 * Platform-wide stats for the super admin dashboard.
 */
const getPlatformStats = async () => {
    const [hospitals] = await pool.execute(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN plan = 'trial' THEN 1 ELSE 0 END) AS on_trial,
                SUM(CASE WHEN plan <> 'trial' THEN 1 ELSE 0 END) AS paid
         FROM hospitals`
    );

    const [users] = await pool.execute(
        `SELECT role, COUNT(*) AS count
         FROM users
         GROUP BY role`
    );

    const [revenue] = await pool.execute(
        `SELECT
            COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END), 0) AS total_revenue,
            COUNT(*) AS total_transactions
         FROM payments`
    );

    const [appointments] = await pool.execute(
        `SELECT status, COUNT(*) AS count
         FROM appointments
         GROUP BY status`
    );

    return {
        hospitals: hospitals[0],
        users,
        revenue: revenue[0],
        appointments
    };
};

const listAllHospitals = async (filters) => {
    return hospitalModel.findAll(filters);
};

const listAllDoctors = async (filters) => {
    return doctorProfileModel.findAll(filters);
};

const listAllPatients = async (filters) => {
    return patientProfileModel.findAll(filters);
};

const listAllPayments = async (filters) => {
    return paymentModel.findAll(filters);
};

const listAllAppointments = async (filters) => {
    return appointmentModel.findAll(filters);
};

/**
 * Add a hospital: creates the admin user, the hospital row, and links
 * them. Returns the generated temp password so the super admin can hand
 * it off.
 */
const addHospital = async (data) => {
    const { hospitalName, adminName, adminEmail, password, phone, city, address, plan = "trial", days = 30 } = data;

    validators.requireFields(data, [
        "hospitalName", "adminName", "adminEmail", "phone", "city"
    ]);

    if (!validators.isEmail(adminEmail)) {
        throw new ApiError(400, "Invalid admin email");
    }

    const existing = await authModel.findUserByEmail(adminEmail);
    if (existing) throw new ApiError(409, "Admin email already registered");

    const adminPassword = password || generateTempPassword(12);
    const n = Number(days) || (plan === "trial" ? 7 : 30);
    const trialExpiresAt = plan === "trial" ? new Date(Date.now() + n * 24 * 60 * 60 * 1000) : null;
    const subExpiresAt   = plan !== "trial" ? new Date(Date.now() + n * 24 * 60 * 60 * 1000) : null;

    const adminUserId = await userModel.createUser({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
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
        trial: plan === "trial",
        trial_expires_at: trialExpiresAt,
        subscription_expires_at: subExpiresAt
    });

    await userModel.updateUserHospital(adminUserId, hospitalId);

    return {
        hospitalId,
        hospitalName,
        city,
        adminEmail,
        adminPassword,
        plan,
        trialExpiresAt: trialExpiresAt?.toISOString() || null,
        subscriptionExpiresAt: subExpiresAt?.toISOString() || null,
        loginUrl: "/login"
    };
};

const updateHospitalPlan = async (id, { plan, days = 30 }) => {
    validators.requireFields({ plan }, ["plan"]);
    const allowed = ["trial", "basic", "pro", "enterprise"];
    if (!allowed.includes(plan)) {
        throw new ApiError(400, "Invalid plan value");
    }
    const hospital = await hospitalModel.findById(id);
    if (!hospital) throw new ApiError(404, "Hospital not found");

    const ok = await hospitalModel.updatePlan(id, { plan, days });
    if (!ok) throw new ApiError(400, "Plan update failed");

    return hospitalModel.findById(id);
};

const removeHospital = async (id) => {
    const hospital = await hospitalModel.findById(id);
    if (!hospital) throw new ApiError(404, "Hospital not found");

    // Unlink users before deleting (FK ON DELETE SET NULL handles the rest).
    await pool.execute(
        `UPDATE users SET hospital_id = NULL WHERE hospital_id = ?`,
        [id]
    );

    const ok = await hospitalModel.remove(id);
    if (!ok) throw new ApiError(400, "Delete failed");

    return { id };
};

/* --- local helper, not exported --- */
function generateTempPassword(length = 12) {
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
}

module.exports = {
    getPlatformStats,
    listAllHospitals,
    listAllDoctors,
    listAllPatients,
    listAllPayments,
    listAllAppointments,
    addHospital,
    updateHospitalPlan,
    removeHospital
};
