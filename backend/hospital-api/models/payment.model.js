const pool = require("../config/database");

const create = async ({
    appointment_id,
    patient_id,
    doctor_id,
    hospital_id = null,
    amount,
    payment_method,
    payment_status = "Pending"
}) => {
    let resolvedHospitalId = hospital_id;
    if (!resolvedHospitalId) {
        const [rows] = await pool.execute(
            `SELECT hospital_id FROM users WHERE id = ? LIMIT 1`,
            [doctor_id]
        );
        resolvedHospitalId = rows[0]?.hospital_id || null;
    }

    const [result] = await pool.execute(
        `INSERT INTO payments
            (appointment_id, patient_id, doctor_id, hospital_id, amount, payment_method, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [appointment_id, patient_id, doctor_id, resolvedHospitalId, amount, payment_method, payment_status]
    );

    return result.insertId;
};

const findByPatient = async (patientId) => {
    const [rows] = await pool.execute(
        `SELECT
            pay.id,
            pay.appointment_id,
            pay.doctor_id,
            pay.hospital_id,
            h.name AS hospital_name,
            pay.amount,
            pay.payment_method,
            pay.payment_status,
            pay.paid_at,
            d.name AS doctor_name
         FROM payments pay
         JOIN users d ON d.id = pay.doctor_id
         LEFT JOIN hospitals h ON h.id = pay.hospital_id
         WHERE pay.patient_id = ?
         ORDER BY pay.id DESC`,
        [patientId]
    );

    return rows;
};

const findByDoctor = async (doctorId) => {
    const [rows] = await pool.execute(
        `SELECT
            pay.id,
            pay.appointment_id,
            pay.patient_id,
            pay.hospital_id,
            h.name AS hospital_name,
            pay.amount,
            pay.payment_method,
            pay.payment_status,
            pay.paid_at,
            p.name AS patient_name
         FROM payments pay
         JOIN users p ON p.id = pay.patient_id
         LEFT JOIN hospitals h ON h.id = pay.hospital_id
         WHERE pay.doctor_id = ?
         ORDER BY pay.id DESC`,
        [doctorId]
    );

    return rows;
};

const findAll = async ({ hospital_id } = {}) => {
    const where = [];
    const params = [];

    if (hospital_id) {
        where.push("pay.hospital_id = ?");
        params.push(hospital_id);
    }

    const sql = `
        SELECT
            pay.id,
            pay.appointment_id,
            pay.patient_id,
            pay.doctor_id,
            pay.hospital_id,
            h.name AS hospital_name,
            pay.amount,
            pay.payment_method,
            pay.payment_status,
            pay.paid_at,
            p.name AS patient_name,
            d.name AS doctor_name
        FROM payments pay
        JOIN users p ON p.id = pay.patient_id
        JOIN users d ON d.id = pay.doctor_id
        LEFT JOIN hospitals h ON h.id = pay.hospital_id
        ${where.length ? "WHERE " + where.join(" AND ") : ""}
        ORDER BY pay.id DESC`;

    const [rows] = await pool.execute(sql, params);
    return rows;
};

const updateStatus = async (id, status) => {
    const [result] = await pool.execute(
        `UPDATE payments
         SET payment_status = ?,
             paid_at = CASE WHEN ? = 'Paid' THEN CURRENT_TIMESTAMP ELSE paid_at END
         WHERE id = ?`,
        [status, status, id]
    );

    return result.affectedRows > 0;
};

module.exports = {
    create,
    findByPatient,
    findByDoctor,
    findAll,
    updateStatus
};
