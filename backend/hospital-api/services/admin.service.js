const userModel = require("../models/user.model");
const appointmentModel = require("../models/appointment.model");
const doctorProfileModel = require("../models/doctorProfile.model");
const patientProfileModel = require("../models/patientProfile.model");
const paymentModel = require("../models/payment.model");
const prescriptionModel = require("../models/prescription.model");
const hospitalModel = require("../models/hospital.model");
const pool = require("../config/database");

/**
 * Admin dashboard summary stats — scoped to the admin's own hospital.
 */
const getDashboardStats = async (hospitalId) => {
    const params = [hospitalId];
    const baseFilter = "WHERE u.hospital_id = ?";

    const [users] = await pool.execute(
        `SELECT role, status, COUNT(*) AS count
         FROM users u
         ${baseFilter}
         GROUP BY role, status`,
        params
    );

    const [appStats] = await pool.execute(
        `SELECT a.status, COUNT(*) AS count
         FROM appointments a
         JOIN users d ON d.id = a.doctor_id
         WHERE d.hospital_id = ?
         GROUP BY a.status`,
        params
    );

    const [revenue] = await pool.execute(
        `SELECT
            COALESCE(SUM(CASE WHEN pay.payment_status = 'Paid' THEN pay.amount ELSE 0 END), 0) AS total_revenue,
            COUNT(*) AS total_transactions
         FROM payments pay
         WHERE pay.hospital_id = ?`,
        params
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

const listAllPatients = async (filters) => {
    return patientProfileModel.findAll(filters);
};

const approveDoctor = async (id) => {
    return userModel.updateUserStatus(id, "ACTIVE");
};

const blockDoctor = async (id) => {
    return userModel.updateUserStatus(id, "BLOCKED");
};

/**
 * Add a doctor (and matching profile) directly from the hospital admin
 * panel — they are auto-approved and scoped to this admin's hospital.
 */
const addDoctor = async (hospitalId, data) => {
    const userId = await userModel.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "DOCTOR",
        status: "ACTIVE",
        hospital_id: hospitalId
    });

    await doctorProfileModel.create({
        user_id: userId,
        hospital_id: hospitalId,
        category_id: data.category_id,
        qualification: data.qualification,
        experience: data.experience || 0,
        consultation_fee: data.consultation_fee || 0,
        phone: data.phone,
        address: data.address
    });

    return doctorProfileModel.findByUserId(userId);
};

/**
 * Add a patient (and matching profile) from the hospital admin panel.
 */
const addPatient = async (hospitalId, data) => {
    const userId = await userModel.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "PATIENT",
        status: "ACTIVE",
        hospital_id: hospitalId
    });

    await patientProfileModel.create({
        user_id: userId,
        hospital_id: hospitalId,
        age: data.age,
        gender: data.gender,
        blood_group: data.blood_group,
        phone: data.phone,
        address: data.address
    });

    return patientProfileModel.findByUserId(userId);
};

module.exports = {
    getDashboardStats,
    listAllDoctors,
    listAllPatients,
    approveDoctor,
    blockDoctor,
    addDoctor,
    addPatient
};
