const pool = require("../config/database");

const create = async ({
    appointment_id,
    patient_id,
    doctor_id,
    amount,
    payment_method,
    payment_status = "Pending"
}) => {
    const [result] = await pool.execute(
        `INSERT INTO payments
            (appointment_id, patient_id, doctor_id, amount, payment_method, payment_status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [appointment_id, patient_id, doctor_id, amount, payment_method, payment_status]
    );

    return result.insertId;
};

const findByPatient = async (patientId) => {
    const [rows] = await pool.execute(
        `SELECT
            pay.id,
            pay.appointment_id,
            pay.doctor_id,
            pay.amount,
            pay.payment_method,
            pay.payment_status,
            pay.paid_at,
            d.name AS doctor_name
         FROM payments pay
         JOIN users d ON d.id = pay.doctor_id
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
            pay.amount,
            pay.payment_method,
            pay.payment_status,
            pay.paid_at,
            p.name AS patient_name
         FROM payments pay
         JOIN users p ON p.id = pay.patient_id
         WHERE pay.doctor_id = ?
         ORDER BY pay.id DESC`,
        [doctorId]
    );

    return rows;
};

const findAll = async () => {
    const [rows] = await pool.execute(
        `SELECT
            pay.id,
            pay.appointment_id,
            pay.patient_id,
            pay.doctor_id,
            pay.amount,
            pay.payment_method,
            pay.payment_status,
            pay.paid_at,
            p.name AS patient_name,
            d.name AS doctor_name
         FROM payments pay
         JOIN users p ON p.id = pay.patient_id
         JOIN users d ON d.id = pay.doctor_id
         ORDER BY pay.id DESC`
    );

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