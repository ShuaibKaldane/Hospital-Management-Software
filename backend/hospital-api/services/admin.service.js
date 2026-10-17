const userModel = require("../models/user.model");
const appointmentModel = require("../models/appointment.model");
const doctorProfileModel = require("../models/doctorProfile.model");
const paymentModel = require("../models/payment.model");
const prescriptionModel = require("../models/prescription.model");
const pool = require("../config/database");

/**
 * Admin dashboard summary stats.
 */
const getDashboardStats = async () => {
    const [users] = await pool.execute(
        `SELECT role, status, COUNT(*) AS count
         FROM users
         GROUP BY role, status`
    );

    const [appStats] = await pool.execute(
        `SELECT status, COUNT(*) AS count
         FROM appointments
         GROUP BY status`
    );

    const [revenue] = await pool.execute(
        `SELECT
            COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN amount ELSE 0 END), 0) AS total_revenue,
            COUNT(*) AS total_transactions
         FROM payments`
    );

    return {
        users,
        appointments: appStats,
        revenue: revenue[0]
    };
};

const listAllDoctors = async (filters) => {
    return doctorProfileModel.findAll(filters);
};

const approveDoctor = async (id) => {
    return userModel.updateUserStatus(id, "ACTIVE");
};

const blockDoctor = async (id) => {
    return userModel.updateUserStatus(id, "BLOCKED");
};

module.exports = {
    getDashboardStats,
    listAllDoctors,
    approveDoctor,
    blockDoctor
};