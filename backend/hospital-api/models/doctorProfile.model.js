const pool = require("../config/database");

/**
 * Create a doctor profile. user_id must already exist in users.
 */
const create = async ({
    user_id,
    category_id,
    qualification,
    experience = 0,
    consultation_fee = 0,
    phone,
    address,
    profile_image
}) => {
    const [result] = await pool.execute(
        `INSERT INTO doctor_profiles
            (user_id, category_id, qualification, experience,
             consultation_fee, phone, address, profile_image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id,
            category_id,
            qualification,
            experience,
            consultation_fee,
            phone || null,
            address || null,
            profile_image || null
        ]
    );

    return result.insertId;
};

/**
 * Full doctor profile joined with user and category.
 */
const findByUserId = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT
            u.id            AS user_id,
            u.name,
            u.email,
            u.status,
            dp.id           AS profile_id,
            dp.category_id,
            dc.category_name,
            dp.qualification,
            dp.experience,
            dp.consultation_fee,
            dp.phone,
            dp.address,
            dp.profile_image,
            dp.created_at,
            dp.updated_at
         FROM users u
         JOIN doctor_profiles dp   ON dp.user_id = u.id
         JOIN doctor_categories dc ON dc.id = dp.category_id
         WHERE u.id = ?
         LIMIT 1`,
        [userId]
    );

    return rows[0];
};

/**
 * List doctors with filters: status, category_id, search by name.
 * Supports pagination.
 */
const findAll = async ({ status, category_id, search, limit = 20, offset = 0 } = {}) => {
    const where = ["u.role = 'DOCTOR'"];
    const params = [];

    if (status) {
        where.push("u.status = ?");
        params.push(status);
    }
    if (category_id) {
        where.push("dp.category_id = ?");
        params.push(category_id);
    }
    if (search) {
        where.push("u.name LIKE ?");
        params.push(`%${search}%`);
    }

    const [rows] = await pool.execute(
        `SELECT
            u.id            AS user_id,
            u.name,
            u.email,
            u.status,
            dp.category_id,
            dc.category_name,
            dp.qualification,
            dp.experience,
            dp.consultation_fee,
            dp.phone,
            dp.created_at
         FROM users u
         JOIN doctor_profiles dp   ON dp.user_id = u.id
         JOIN doctor_categories dc ON dc.id = dp.category_id
         WHERE ${where.join(" AND ")}
         ORDER BY u.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, Number(limit), Number(offset)]
    );

    return rows;
};

const update = async (userId, fields) => {
    const allowed = [
        "category_id",
        "qualification",
        "experience",
        "consultation_fee",
        "phone",
        "address",
        "profile_image"
    ];

    const updates = [];
    const params = [];

    for (const key of allowed) {
        if (fields[key] !== undefined) {
            updates.push(`${key} = ?`);
            params.push(fields[key]);
        }
    }

    if (updates.length === 0) return false;

    params.push(userId);

    const [result] = await pool.execute(
        `UPDATE doctor_profiles SET ${updates.join(", ")} WHERE user_id = ?`,
        params
    );

    return result.affectedRows > 0;
};

module.exports = {
    create,
    findByUserId,
    findAll,
    update
};