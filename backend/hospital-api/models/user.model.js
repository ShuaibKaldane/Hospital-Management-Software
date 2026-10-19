const pool = require("../config/database");
const bcrypt = require("bcrypt");

/**
 * Create a new user. Returns the inserted id.
 *
 * `hospital_id` is null for SUPER_ADMIN, required for ADMIN/DOCTOR/PATIENT.
 */
const createUser = async ({ name, email, password, role, status = "ACTIVE", hospital_id = null }) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
        `INSERT INTO users (name, email, password, role, status, hospital_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, role, status, hospital_id]
    );

    return result.insertId;
};

/**
 * Find a user by id (without password). Includes hospital_id for tenant scoping.
 */
const findUserById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT id, name, email, role, status, hospital_id, created_at
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [id]
    );

    return rows[0];
};

/**
 * Update a user's status (ACTIVE / PENDING / BLOCKED).
 */
const updateUserStatus = async (id, status) => {
    const [result] = await pool.execute(
        `UPDATE users SET status = ? WHERE id = ?`,
        [status, id]
    );

    return result.affectedRows > 0;
};

/**
 * Link a user to a hospital (used by trial activation to back-fill
 * the hospital_id on the just-created admin user).
 */
const updateUserHospital = async (userId, hospitalId) => {
    const [result] = await pool.execute(
        `UPDATE users SET hospital_id = ? WHERE id = ?`,
        [hospitalId, userId]
    );

    return result.affectedRows > 0;
};

module.exports = {
    createUser,
    findUserById,
    updateUserStatus,
    updateUserHospital
};
