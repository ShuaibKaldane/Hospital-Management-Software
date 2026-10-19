const pool = require("../config/database");

/**
 * Tenant-level hospital record.
 *
 * Mirrors the `hospitals` table. The column list is
 * intentionally small — everything profile-shaped lives
 * on `users` / `patient_profiles` / `doctor_profiles`.
 */
const createHospital = async ({
    name,
    city,
    address,
    phone,
    admin_user_id,
    plan = "trial",
    trial = true,
    trial_expires_at = null
}) => {
    const [result] = await pool.execute(
        `INSERT INTO hospitals
            (name, city, address, phone, admin_user_id, plan, trial, trial_expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name,
            city || null,
            address || null,
            phone || null,
            admin_user_id || null,
            plan,
            trial ? 1 : 0,
            trial_expires_at
        ]
    );

    return result.insertId;
};

const findByAdminEmail = async (email) => {
    const [rows] = await pool.execute(
        `SELECT
            h.id,
            h.name,
            h.city,
            h.address,
            h.phone,
            h.admin_user_id,
            h.plan,
            h.trial,
            h.trial_expires_at,
            h.created_at,
            u.email AS admin_email
         FROM hospitals h
         LEFT JOIN users u ON u.id = h.admin_user_id
         WHERE u.email = ?
         LIMIT 1`,
        [email]
    );

    return rows[0];
};

module.exports = {
    createHospital,
    findByAdminEmail
};
