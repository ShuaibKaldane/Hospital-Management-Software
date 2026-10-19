const pool = require("../config/database");

const create = async ({ doctor_id, hospital_id = null, amount, transaction_type, reason }) => {
    let resolvedHospitalId = hospital_id;
    if (!resolvedHospitalId) {
        const [rows] = await pool.execute(
            `SELECT hospital_id FROM users WHERE id = ? LIMIT 1`,
            [doctor_id]
        );
        resolvedHospitalId = rows[0]?.hospital_id || null;
    }

    const [result] = await pool.execute(
        `INSERT INTO doctor_salary_transactions
            (doctor_id, hospital_id, amount, transaction_type, reason)
         VALUES (?, ?, ?, ?, ?)`,
        [doctor_id, resolvedHospitalId, amount, transaction_type, reason || null]
    );

    return result.insertId;
};

const findByDoctor = async (doctorId) => {
    const [rows] = await pool.execute(
        `SELECT
            s.id,
            s.hospital_id,
            s.doctor_id,
            s.amount,
            s.transaction_type,
            s.reason,
            s.created_at,
            u.name AS doctor_name
         FROM doctor_salary_transactions s
         JOIN users u ON u.id = s.doctor_id
         WHERE s.doctor_id = ?
         ORDER BY s.created_at DESC`,
        [doctorId]
    );

    return rows;
};

const findAll = async ({ hospital_id } = {}) => {
    const where = [];
    const params = [];

    if (hospital_id) {
        where.push("s.hospital_id = ?");
        params.push(hospital_id);
    }

    const sql = `
        SELECT
            s.id,
            s.hospital_id,
            h.name AS hospital_name,
            s.doctor_id,
            s.amount,
            s.transaction_type,
            s.reason,
            s.created_at,
            u.name AS doctor_name
        FROM doctor_salary_transactions s
        JOIN users u ON u.id = s.doctor_id
        LEFT JOIN hospitals h ON h.id = s.hospital_id
        ${where.length ? "WHERE " + where.join(" AND ") : ""}
        ORDER BY s.created_at DESC`;

    const [rows] = await pool.execute(sql, params);
    return rows;
};

const getNetEarningsByDoctor = async (doctorId) => {
    const [rows] = await pool.execute(
        `SELECT
            COALESCE(SUM(CASE WHEN transaction_type IN ('Salary','Bonus') THEN amount ELSE 0 END), 0) AS credits,
            COALESCE(SUM(CASE WHEN transaction_type = 'Deduction' THEN amount ELSE 0 END), 0) AS debits
         FROM doctor_salary_transactions
         WHERE doctor_id = ?`,
        [doctorId]
    );

    const credits = Number(rows[0]?.credits || 0);
    const debits = Number(rows[0]?.debits || 0);

    return {
        credits,
        debits,
        net: credits - debits
    };
};

module.exports = {
    create,
    findByDoctor,
    findAll,
    getNetEarningsByDoctor
};
