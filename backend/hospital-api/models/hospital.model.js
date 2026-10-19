const pool = require("../config/database");

/**
 * Tenant-level hospital record. Mirrors the `hospitals` table.
 */
const createHospital = async ({
    name,
    city,
    address,
    phone,
    admin_user_id,
    plan = "trial",
    trial = true,
    trial_expires_at = null,
    subscription_expires_at = null
}) => {
    const [result] = await pool.execute(
        `INSERT INTO hospitals
            (name, city, address, phone, admin_user_id, plan, trial, trial_expires_at, subscription_expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name,
            city || null,
            address || null,
            phone || null,
            admin_user_id || null,
            plan,
            trial ? 1 : 0,
            trial_expires_at,
            subscription_expires_at
        ]
    );

    return result.insertId;
};

const findById = async (id) => {
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
            h.subscription_expires_at,
            h.created_at,
            h.updated_at,
            u.email AS admin_email,
            u.name  AS admin_name
         FROM hospitals h
         LEFT JOIN users u ON u.id = h.admin_user_id
         WHERE h.id = ?
         LIMIT 1`,
        [id]
    );

    return rows[0];
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
            h.subscription_expires_at,
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

/**
 * List all hospitals with computed `days_left` for the trial /
 * subscription window and the linked admin's email.
 */
const findAll = async ({ search, plan } = {}) => {
    const where = [];
    const params = [];

    if (search) {
        where.push("h.name LIKE ?");
        params.push(`%${search}%`);
    }
    if (plan) {
        where.push("h.plan = ?");
        params.push(plan);
    }

    const sql = `
        SELECT
            h.id,
            h.name,
            h.city,
            h.address,
            h.phone,
            h.admin_user_id,
            h.plan,
            h.trial,
            h.trial_expires_at,
            h.subscription_expires_at,
            h.created_at,
            u.email AS admin_email,
            u.name  AS admin_name,
            CASE
                WHEN h.trial = 1 AND h.trial_expires_at IS NOT NULL
                    THEN GREATEST(DATEDIFF(h.trial_expires_at, NOW()), 0)
                WHEN h.subscription_expires_at IS NOT NULL
                    THEN GREATEST(DATEDIFF(h.subscription_expires_at, NOW()), 0)
                ELSE NULL
            END AS days_left
        FROM hospitals h
        LEFT JOIN users u ON u.id = h.admin_user_id
        ${where.length ? "WHERE " + where.join(" AND ") : ""}
        ORDER BY h.created_at DESC`;

    const [rows] = await pool.execute(sql, params);
    return rows;
};

/**
 * Set or extend a hospital's plan. trial_expires_at is computed for
 * trial plans; subscription_expires_at for paid ones. `days` is the
 * number of days from NOW() the window should last.
 */
const updatePlan = async (id, { plan, days = 30, trial }) => {
    let trialVal = trial;
    let trialExpires = null;
    let subExpires = null;
    const n = Number(days) || 30;

    if (plan === "trial") {
        trialVal = 1;
        trialExpires = new Date(Date.now() + n * 24 * 60 * 60 * 1000);
    } else {
        trialVal = 0;
        subExpires = new Date(Date.now() + n * 24 * 60 * 60 * 1000);
    }

    const [result] = await pool.execute(
        `UPDATE hospitals
            SET plan = ?,
                trial = ?,
                trial_expires_at = ?,
                subscription_expires_at = ?
          WHERE id = ?`,
        [plan, trialVal ? 1 : 0, trialExpires, subExpires, id]
    );

    return result.affectedRows > 0;
};

/**
 * Delete a hospital. CASCADE on the FK chain (admin_user_id
 * SET NULL, users.hospital_id SET NULL) means user records survive
 * but lose their tenant association.
 */
const remove = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM hospitals WHERE id = ?`,
        [id]
    );

    return result.affectedRows > 0;
};

module.exports = {
    createHospital,
    findById,
    findByAdminEmail,
    findAll,
    updatePlan,
    remove
};
