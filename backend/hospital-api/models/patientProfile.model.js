const pool = require("../config/database");

const create = async ({
    user_id,
    hospital_id = null,
    age,
    gender,
    blood_group,
    phone,
    address
}) => {
    const [result] = await pool.execute(
        `INSERT INTO patient_profiles
            (user_id, hospital_id, age, gender, blood_group, phone, address)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id,
            hospital_id,
            age || null,
            gender || null,
            blood_group || null,
            phone || null,
            address || null
        ]
    );

    return result.insertId;
};

const findByUserId = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT
            u.id      AS user_id,
            u.name,
            u.email,
            u.status,
            u.hospital_id,
            pp.id     AS profile_id,
            pp.age,
            pp.gender,
            pp.blood_group,
            pp.phone,
            pp.address,
            pp.created_at,
            pp.updated_at
         FROM users u
         JOIN patient_profiles pp ON pp.user_id = u.id
         WHERE u.id = ?
         LIMIT 1`,
        [userId]
    );

    return rows[0];
};

const findAll = async ({ status, search, hospital_id, limit = 20, offset = 0 } = {}) => {
    const where = ["u.role = 'PATIENT'"];
    const params = [];

    if (status) {
        where.push("u.status = ?");
        params.push(status);
    }
    if (search) {
        where.push("u.name LIKE ?");
        params.push(`%${search}%`);
    }
    if (hospital_id) {
        where.push("u.hospital_id = ?");
        params.push(hospital_id);
    }

    const [rows] = await pool.execute(
        `SELECT
            u.id      AS user_id,
            u.name,
            u.email,
            u.status,
            u.hospital_id,
            h.name    AS hospital_name,
            pp.age,
            pp.gender,
            pp.blood_group,
            pp.phone,
            pp.created_at
         FROM users u
         JOIN patient_profiles pp ON pp.user_id = u.id
         LEFT JOIN hospitals h    ON h.id = u.hospital_id
         WHERE ${where.join(" AND ")}
         ORDER BY u.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, Number(limit), Number(offset)]
    );

    return rows;
};

const update = async (userId, fields) => {
    const allowed = ["age", "gender", "blood_group", "phone", "address"];
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
        `UPDATE patient_profiles SET ${updates.join(", ")} WHERE user_id = ?`,
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
