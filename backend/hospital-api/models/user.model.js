const pool = require("../config/database");
const bcrypt = require("bcrypt");

/**
 * Create a new user. Returns the inserted id.
 */
const createUser = async ({ name, email, password, role, status = "ACTIVE" }) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
        `INSERT INTO users (name, email, password, role, status)
         VALUES (?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, role, status]
    );

    return result.insertId;
};

/**
 * Find a user by id (without password).
 */
const findUserById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT id, name, email, role, status, created_at
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

module.exports = {
    createUser,
    findUserById,
    updateUserStatus
};