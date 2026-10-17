const pool = require("../config/database");

const create = async ({ doctor_id, amount, transaction_type, reason }) => {
    const [result] = await pool.execute(
        `INSERT INTO doctor_salary_transactions
            (doctor_id, amount, transaction_type, reason)
         VALUES (?, ?, ?, ?)`,
        [doctor_id, amount, transaction_type, reason || null]
    );

    return result.insertId;
};

const findByDoctor = async (doctorId) => {
    const [rows] = await pool.execute(
        `SELECT
            s.id,
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

const findAll = async () => {
    const [rows] = await pool.execute(
        `SELECT
            s.id,
            s.doctor_id,
            s.amount,
            s.transaction_type,
            s.reason,
            s.created_at,
            u.name AS doctor_name
         FROM doctor_salary_transactions s
         JOIN users u ON u.id = s.doctor_id
         ORDER BY s.created_at DESC`
    );

    return rows;
};

/**
 * Net earnings = SUM(Salary + Bonus) - SUM(Deduction).
 */
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